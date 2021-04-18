import "dotenv/config";
import debugModule from "debug";
import { MediaKind, Producer, Router, Worker } from "mediasoup/lib/types";
import * as Sentry from "@sentry/node";
import { MyRooms } from "./MyRoomState";
import { closePeer } from "./utils/closePeer";
import { createConsumer } from "./utils/createConsumer";
import { createTransport, transportToOptions } from "./utils/createTransport";
import { deleteRoom } from "./utils/deleteRoom";
import { startMediasoup } from "./utils/startMediasoup";
import { HandlerMap, startRabbit } from "./utils/startRabbit";

const log = debugModule("crowdwire:index");
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
        // peer?.sendTransport?.close();
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
          (!peerState.producer?.has('audio') && !peerState.producer?.has('video'))) {
          continue;
        }
        console.log("tem pelo menos 1 producer")
        try {
          const { producer } = peerState;
          console.log("q producer temos aqui?")
          console.log(producer)
          for (let value of producer.values()) {
            console.log("aqui")
            console.log(value)
            consumerParametersArr.push(
              await createConsumer(
                router,
                value,
                rtpCapabilities,
                transport,
                myPeerId,
                state[theirPeerId]
              )
            );
          }
        } catch (e) {
          errLog(e.message);
          continue;
        }
      }
      console.log("aqui2")
      console.log(consumerParametersArr)
      send({
        topic: "@get-recv-tracks-done",
        uid,
        d: { consumerParametersArr, roomId, peerId: myPeerId },
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
        if (previousProducer && previousProducer.has(kind)) {
          previousProducer.get(kind)!.close();
          consumers.forEach((c) => {
            if (c.kind == kind ) c.close()
              // @todo give some time for frontends to get update, but this can be removed
              send({
                rid: roomId,
                topic: "close_consumer",
                d: { producerId: previousProducer.get(kind)!.id, roomId },
              });
          })
        }

        const producer = await transport.produce({
          kind,
          rtpParameters,
          paused,
          appData: { ...appData, peerId: myPeerId, transportId },
        });
        
        if (!rooms[roomId].state[myPeerId].producer) {
          rooms[roomId].state[myPeerId].producer = new Map<MediaKind, Producer>();
          rooms[roomId].state[myPeerId].producer!.set(kind, producer);
        } else {
          rooms[roomId].state[myPeerId].producer!.set(kind, producer);
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
              d: { ...d, roomId, peerId: myPeerId },
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
        send({
          topic: "error",
          d: "error connecting to voice server | " + e.message,
          uid,
        });
        return;
      }
    },
    ["@connect-transport"]: async (
      { roomId, dtlsParameters, peerId, direction },
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

      log("connect-transport", peerId, transport.appData);

      try {
        await transport.connect({ dtlsParameters });
      } catch (e) {
        console.log(e);
        send({
          topic: `@connect-transport-${direction}-done` as const,
          uid,
          d: { error: e.message, roomId },
        });
        send({
          topic: "error",
          d: "error connecting to voice server | " + e.message,
          uid,
        });
        return;
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
    ["add-speaker"]: async ({ roomId, peerId }, uid, send, errBack) => {
      if (!rooms[roomId]?.state[peerId]) {
        errBack();
        return;
      }
      log("add-speaker", peerId);

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
      log("join-as-new-speaker", peerId);

      const { state, router } = rooms[roomId];
      const [recvTransport, sendTransport] = await Promise.all([
        createTransport("recv", router, peerId),
        createTransport("send", router, peerId),
      ]);
      
      if (state[peerId]) {
        closePeer(state[peerId]);
      }
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
      log("join-as-new-peer", peerId);
      const { state, router } = rooms[roomId];
      const [recvTransport, sendTransport] = await Promise.all([
        createTransport("recv", router, peerId),
        createTransport("send", router, peerId),
      ]);
      
      if (state[peerId]) {
        closePeer(state[peerId]);
      }

      rooms[roomId].state[peerId] = {
        recvTransport: recvTransport,
        sendTransport: sendTransport,
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
          sendTransportOptions: transportToOptions(sendTransport),
        },
        uid,
      });
    },
  } as HandlerMap);
}

main();
