import "dotenv/config";
import debugModule from "debug";
import { DataProducer, Producer, Router, Worker } from "mediasoup/lib/types";
import * as Sentry from "@sentry/node";
import { MyRooms } from "./MyRoomState";
import { closePeer } from "./utils/closePeer";
import { createConsumer } from "./utils/createConsumer";
import { createDataConsumer } from "./utils/createDataConsumer";
import { createTransport, transportToOptions } from "./utils/createTransport";
import { deleteRoom } from "./utils/deleteRoom";
import { startMediasoup } from "./utils/startMediasoup";
import { HandlerMap, startRabbit } from "./utils/startRabbit";

// const log = debugModule("crowdwire:index");
const errLog = debugModule("crowdwire:ERROR");

const rooms: MyRooms = {};

async function main() {
  if (process.env.SENTRY_DNS) {
    Sentry.init({
      dsn: process.env.SENTRY_DNS,
      enabled: !!process.env.SENTRY_DNS,
      debug: true,
    });
  }
  // start mediasoup
  console.log("starting mediasoup");
  let workers: {
    worker: Worker;
    router: Router;
  }[];
  try {
    workers = await startMediasoup();
  } catch (err) {
    console.log(err);
    throw err;
  }
  let workerIdx = 0;

  const getNextWorker = () => {
    const w = workers[workerIdx];
    workerIdx++;
    workerIdx %= workers.length;
    return w;
  };

  const createRoom = () => {
    const { worker, router } = getNextWorker();

    return { worker, router, state: {} };
  };

  await startRabbit({
    "remove-speaker": ({ roomId, peerId }) => {
      if (roomId in rooms) {
        const peer = rooms[roomId].state[peerId];
        peer?.producer?.get('audio')?.close();
        peer?.sendTransport?.close();
      }
    },
    ['remove-user-from-groups']: ({ roomIds, peerId }) => {
      for (let i = 0; i < roomIds.length; i++) {
        let roomId = roomIds[i];
        if (roomId in rooms) {
          if (peerId in rooms[roomId].state) {
            closePeer(rooms[roomId].state[peerId]);
            delete rooms[roomId].state[peerId];
          }
          if (Object.keys(rooms[roomId].state).length === 0) {
            deleteRoom(roomId, rooms);
          }
        }
      }
    },
    ["destroy-room"]: ({ roomId }) => {
      if (roomId in rooms) {
        for (const peer of Object.values(rooms[roomId].state)) {
          closePeer(peer);
        }
        deleteRoom(roomId, rooms);
      }
    },
    ['toggle-producer']: ({ roomId, peerId, kind, pause }) => {
      if (roomId in rooms) {
        const peer = rooms[roomId].state[peerId];
        if (pause)
          //@ts-ignore
          peer?.producer?.get(kind)?.pause();
        else
          //@ts-ignore
          peer?.producer?.get(kind)?.resume();
      }
    },
    ['close-media']: ({ roomId, peerId }) => {
      if (roomId in rooms) {
        const peer = rooms[roomId].state[peerId];
        peer?.producer?.get('media')?.close();
      }
    },
    ["close-peer"]: async ({ roomId, peerId, kicked }, uid, send) => {
      if (roomId in rooms) {
        if (peerId in rooms[roomId].state) {
          closePeer(rooms[roomId].state[peerId]);
          delete rooms[roomId].state[peerId];
        }
        if (Object.keys(rooms[roomId].state).length === 0) {
          deleteRoom(roomId, rooms);
        }
        send({ uid, topic: "you_left_room", d: { roomId, kicked: !!kicked } });
      }
    },
    ["@get-recv-tracks"]: async (
      { roomId, peerId: myPeerId, rtpCapabilities },
      uid,
      send,
      errBack
    ) => {

      if (!rooms[roomId]?.state[myPeerId]?.recvTransport) {
        errBack();
        return;
      }

      const { state, router } = rooms[roomId];
      const transport = state[myPeerId].recvTransport;
      if (!transport) {
        errBack();
        return;
      }

      const consumerParametersArr = [];

      for (const theirPeerId of Object.keys(state)) {
        const peerState = state[theirPeerId];
        if (theirPeerId === myPeerId || !peerState ||
          (!peerState.producer?.has('audio') && !peerState.producer?.has('video')
          && !peerState.producer?.has('media') && !peerState.producer?.has('file'))) {
          continue;
        }
        try {
          const { producer } = peerState;
          for (let [key, value] of producer.entries()) {
            if (key != 'file') {
              consumerParametersArr.push(
                {'consumer': await createConsumer(
                  router,
                  //@ts-ignore
                  value,
                  rtpCapabilities,
                  transport,
                  myPeerId,
                  state[theirPeerId]
                ), 'kind': key}
              );
            } else {
              consumerParametersArr.push(
                {'consumer': await createDataConsumer(
                  //@ts-ignore
                  producer,
                  transport,
                  myPeerId,
                  state[theirPeerId]
                ), 'kind': key}
              );
            }
          }
        } catch (e) {
          errLog(e.message);
          continue;
        }
      }

      send({
        topic: "@get-recv-tracks-done",
        uid,
        d: { consumerParametersArr, roomId, peerId: myPeerId},
      });
    },
    ["@send-track"]: async (
      {
        roomId,
        transportId,
        direction,
        peerId: myPeerId,
        kind,
        rtpParameters,
        rtpCapabilities,
        paused,
        appData,
      },
      uid,
      send,
      errBack
    ) => {
      if (!(roomId in rooms)) {
        errBack();
        return;
      }
      const { state } = rooms[roomId];
      const { sendTransport, producer: previousProducer, consumers } =
        state[myPeerId];
      const transport = sendTransport;
      
      if (!transport) {
        errBack();
        return;
      }
      try {
        if (previousProducer && previousProducer.has(appData.mediaTag)) {
          previousProducer.get(appData.mediaTag)!.close();
          consumers.forEach((c) => {
            if (c.appData.mediaTag == appData.mediaTag ) c.close()
              // @todo give some time for frontend to get update, but this can be removed
              send({
                rid: roomId,
                topic: "close_consumer",
                d: { producerId: previousProducer.get(appData.mediaTag)!.id, roomId },
              });
          })
        }

        const producer = await transport.produce({
          kind,
          rtpParameters,
          paused,
          appData: { ...appData, peerId: myPeerId, transportId },
        });
        
        if (!state[myPeerId].producer) {
          state[myPeerId].producer = new Map<string, Producer|DataProducer>();
          state[myPeerId].producer!.set(appData.mediaTag, producer);
        } else {
          state[myPeerId].producer!.set(appData.mediaTag, producer);
        }

        for (const theirPeerId of Object.keys(state)) {
          if (theirPeerId === myPeerId) {
            continue;
          }
          const peerTransport = state[theirPeerId]?.recvTransport;
          if (!peerTransport) {
            continue;
          }
          try {
            const d = await createConsumer(
              rooms[roomId].router,
              producer,
              rtpCapabilities,
              peerTransport,
              myPeerId,
              state[theirPeerId]
            );

            send({
              uid: theirPeerId,
              topic: "new-peer-producer",
              d: { ...d, roomId, kind: appData.mediaTag, peerId: myPeerId },
            });
          } catch (e) {
            errLog(e.message);
          }
        }
        send({
          topic: `@send-track-${direction}-done` as const,
          uid,
          d: {
            id: producer.id,
            roomId,
            peerId: myPeerId,
          },
        });
      } catch (e) {
        send({
          topic: `@send-track-${direction}-done` as const,
          uid,
          d: {
            error: e.message,
            roomId,
            peerId: myPeerId,
          },
        });
        // send({
        //   topic: "error",
        //   d: "error connecting to voice server | " + e.message,
        //   uid,
        // });
        return;
      }
    },
    ["@send-file"]: async (
      {
        roomId,
        transportId,
        direction,
        peerId: myPeerId,
        sctpStreamParameters,
        appData,
      },
      uid,
      send,
      errBack
    ) => {
      if (!(roomId in rooms)) {
        errBack();
        return;
      }
      const { state } = rooms[roomId];
      const { sendTransport, producer: previousProducer, consumers } =
        state[myPeerId];
      const transport = sendTransport;
      
      if (!transport) {
        errBack();
        return;
      }
      try {
        if (previousProducer && previousProducer.has(appData.mediaTag)) {
          previousProducer.get(appData.mediaTag)!.close();
          consumers.forEach((c) => {
            if (c.appData.mediaTag == appData.mediaTag ) c.close()
              // @todo give some time for frontend to get update, but this can be removed
              send({
                rid: roomId,
                topic: "close_consumer",
                d: { producerId: previousProducer.get(appData.mediaTag)!.id, roomId },
              });
          })
        }

        const producer = await transport.produceData({
          sctpStreamParameters,
          appData: { ...appData, peerId: myPeerId, transportId },
        });
        
        if (!state[myPeerId].producer) {
          state[myPeerId].producer = new Map<string, Producer|DataProducer>();
          state[myPeerId].producer!.set(appData.mediaTag, producer);
        } else {
          state[myPeerId].producer!.set(appData.mediaTag, producer);
        }

        for (const theirPeerId of Object.keys(state)) {
          if (theirPeerId === myPeerId) {
            continue;
          }

          const peerTransport = state[theirPeerId]?.recvTransport;
          if (!peerTransport) {
            continue;
          }
          try {
            const d = await createDataConsumer(
              producer,
              peerTransport,
              myPeerId,
              state[theirPeerId]
            );

            send({
              uid: theirPeerId,
              topic: "new-peer-data-producer",
              d: { ...d, roomId, peerId: myPeerId },
            });
          } catch (e) {
            errLog(e.message);
          }
        }
        send({
          topic: `@send-file-${direction}-done` as const,
          uid,
          d: {
            id: producer.id,
            roomId,
            peerId: myPeerId,
          },
        });
      } catch (e) {
        send({
          topic: `@send-file-${direction}-done` as const,
          uid,
          d: {
            error: e.message,
            roomId,
            peerId: myPeerId,
          },
        });
        // send({
        //   topic: "error",
        //   d: "error connecting to voice server | " + e.message,
        //   uid,
        // });
        return;
      }
    },
    ["@connect-transport"]: async (
      { roomId, dtlsParameters, sctpParameters, peerId, direction },
      uid,
      send,
      errBack
    ) => {
      if (!rooms[roomId]?.state[peerId]) {
        errBack();
        return;
      }
      const { state } = rooms[roomId];
      const transport =
        direction === "recv"
          ? state[peerId].recvTransport
          : state[peerId].sendTransport;

      if (!transport) {
        errBack();
        return;
      }

      console.log("connect-transport", peerId, transport.appData);
      try {
        await transport.connect({ dtlsParameters, sctpParameters });
      } catch (e) {
        console.log(e);
        send({
          topic: `@connect-transport-${direction}-done` as const,
          uid,
          d: { error: e.message, roomId },
        });
      }
      send({
        topic: `@connect-transport-${direction}-done` as const,
        uid,
        d: { roomId, peerId: peerId },
      });
    },
    ["create-room"]: async ({ roomId }, uid, send) => {
      if (!(roomId in rooms)) {
        rooms[roomId] = createRoom();
      }
      send({ topic: "room-created", d: { roomId }, uid });
    },
    ["add-speaker"]: async ({ roomId, peerId }, uid, send) => {
      if (!rooms[roomId]?.state[peerId]) {
        return;
      }
      
      console.log("add-speaker", peerId);

      const { router } = rooms[roomId];
      const sendTransport = await createTransport("send", router, peerId);
      rooms[roomId].state[peerId].sendTransport?.close();
      rooms[roomId].state[peerId].sendTransport = sendTransport;

      send({
        topic: "you-are-now-a-speaker",
        d: {
          sendTransportOptions: transportToOptions(sendTransport),
          roomId,
          peerId,
        },
        uid,
      });
    },
    ["join-as-speaker"]: async ({ roomId, peerId }, uid, send) => {
      if (!(roomId in rooms)) {
        rooms[roomId] = createRoom();
      }

      console.log("join-as-new-speaker", peerId);
      
      const { state, router } = rooms[roomId];

      if (state[peerId]) {
        closePeer(state[peerId]);
      }

      const [recvTransport, sendTransport] = await Promise.all([
        createTransport("recv", router, peerId),
        createTransport("send", router, peerId),
      ]);
      
      rooms[roomId].state[peerId] = {
        recvTransport: recvTransport,
        sendTransport: sendTransport,
        consumers: [],
        producer: null,
      };

      send({
        topic: "you-joined-as-speaker",
        d: {
          roomId,
          peerId,
          routerRtpCapabilities: rooms[roomId].router.rtpCapabilities,
          recvTransportOptions: transportToOptions(recvTransport),
          sendTransportOptions: transportToOptions(sendTransport),
        },
        uid,
      });
    },
    ["join-as-new-peer"]: async ({ roomId, peerId }, uid, send) => {
      if (!(roomId in rooms)) {
        rooms[roomId] = createRoom();
      }
      
      console.log("join-as-new-peer", peerId);

      const { state, router } = rooms[roomId];
      const [recvTransport] = await Promise.all([
        createTransport("recv", router, peerId)
        // createTransport("send", router, peerId),
      ]);

      if (state[peerId]) {
        closePeer(state[peerId]);
      }

      rooms[roomId].state[peerId] = {
        recvTransport: recvTransport,
        // sendTransport: sendTransport,
        sendTransport: null,
        consumers: [],
        producer: null,
      };

      send({
        topic: "you-joined-as-peer",
        d: {
          roomId,
          peerId,
          routerRtpCapabilities: rooms[roomId].router.rtpCapabilities,
          recvTransportOptions: transportToOptions(recvTransport),
          // sendTransportOptions: transportToOptions(sendTransport),
        },
        uid,
      });
    },
  } as HandlerMap);
}

main();
