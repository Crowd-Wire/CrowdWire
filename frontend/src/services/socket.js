import { WS_BASE } from "config";
import { createTransport } from "../webrtc/utils/createTransport";
import { sendVoice } from "../webrtc/utils/sendVoice";
import { sendVideo } from "../webrtc/utils/sendVideo";
import { joinRoom } from "../webrtc/utils/joinRoom";
import { consumeStream } from "../webrtc/utils/consumeStream";
import { receiveVideoVoice } from "../webrtc/utils/receiveVideoVoice";
import { useRoomStore } from "../webrtc/stores/useRoomStore";
import { useConsumerStore } from "../webrtc/stores/useConsumerStore";
import { useWsHandlerStore } from "../webrtc/stores/useWsHandlerStore";

import playerStore from "stores/usePlayerStore.ts";

let commSocket;

export const getCommSocket = () => {
  if (!commSocket)
    commSocket = new WebSocket(`${WS_BASE}/?`);
  return commSocket;
}

async function flushConsumerQueue(_roomId) {
  try {
    for (const {
      roomId,
      d: { peerId, consumerParameters },
    } of consumerQueue) {
      if (_roomId === roomId) {
        await consumeStream(consumerParameters, peerId, consumerParameters.kind)
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    consumerQueue = [];
  }
}

async function consumeAll(consumerParametersArr) {
  try {
    for (const { consumer, kind } of consumerParametersArr) {
      if (!(await consumeStream(consumer.consumerParameters, consumer.peerId, kind))) {
        break;
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    flushConsumerQueue();
  }
}


let socket = null;
let consumerQueue = [];

export const getSocket = (worldId) => {

  const joinRoom = async (roomId, position) => {
    const payload = {
        topic: "JOIN_PLAYER",
        room_id: roomId,
        position
    }
    if (socket.readyState === WebSocket.OPEN)
        await socket.send(JSON.stringify(payload));
    else
        console.error(`[error] socket closed before joinRoom`);
  }

  const sendMovement = async (roomId, position, velocity) => {
      const payload = {
          topic: "PLAYER_MOVEMENT",
          room_id: roomId,
          position,
          velocity,
      }
      if (socket.readyState === WebSocket.OPEN)
          await socket.send(JSON.stringify(payload));
      else
          console.error(`[error] socket closed before sendMovement`);
  }

  const wirePlayer = async (roomId, playerId) => {
    const payload = {
      topic: "WIRE_PLAYER",
      room_id: roomId,
      player_id: playerId,
    }
    if (socket.readyState === WebSocket.OPEN)
      await socket.send(JSON.stringify(payload));
    else
      console.error(`[error] socket closed before wirePlayer`);
  }

  const unwirePlayer = async (roomId, playerId) => {
    const payload = {
      topic: "UNWIRE_PLAYER",
      room_id: roomId,
      player_id: playerId,
    }
    if (socket.readyState === WebSocket.OPEN)
      await socket.send(JSON.stringify(payload));
    else
      console.error(`[error] socket closed before wirePlayer`);
  }

  const sendComms = async (topic="", worldId="", userId="") => {
    const payload = {
      topic: topic,
      worldId: worldId,
      userId:userId,
    }
    await socket.send(JSON.stringify(payload));
  }

  if (!socket) {
      socket = new WebSocket(`${WS_BASE}/ws/${worldId}`);

      socket.onopen = async (event) => {
          console.info("[open] Connection established");
          await socket.send(JSON.stringify({token: '', room_id: '1'}));
          // const id = setInterval(() => {
          //     if (socket && socket.readyState !== socket.CLOSED) {
          //         socket.send("ping");
          //     } else {
          //         clearInterval(id);
          //     }
          // }, 8000);
      };

    socket.onmessage = (event) => {
      var data = JSON.parse(event.data);

      console.info(`[message] Data received for topic ${data.topic}`);

      switch (data.topic) {
        case "JOIN_PLAYER":
            playerStore.getState().connectPlayer(data.user_id, data.position);
            break;
        case "LEAVE_PLAYER":
            playerStore.getState().disconnectPlayer(data.user_id);
            break;
        case "PLAYER_MOVEMENT":
            playerStore.getState().movePlayer(data.user_id, data.position, data.velocity);
            break;
        case "you-joined-as-peer":
          console.log(data)
          joinRoom(data.d.routerRtpCapabilities, data.d.roomId).then(() => {
              createTransport(data.d.roomId, "recv", data.d.recvTransportOptions).then(() => {
                receiveVideoVoice(data.d.roomId, () => flushConsumerQueue(data.d.roomId));
              })
              createTransport(data.d.roomId, "send", data.d.sendTransportOptions).then(() => {
                sendVideo();
              });
          })
          break;
        case "you-joined-as-speaker":
          console.log(data)
          joinRoom(data.d.routerRtpCapabilities, data.d.roomId).then(() => {
              createTransport(data.d.roomId, "recv", data.d.recvTransportOptions).then(() => {
                receiveVideoVoice(data.d.roomId, () => flushConsumerQueue(data.d.roomId));
              })
              createTransport(data.d.roomId, "send", data.d.sendTransportOptions).then(() => {
                sendVoice();
                sendVideo();
              });
          })
          break;
        case "@get-recv-tracks-done":
          console.log(data)
          consumeAll(data.d.consumerParametersArr);
          break;
        case "new-peer-producer":
          console.log(data)
          if (useRoomStore.getState().recvTransport && useRoomStore.getState().roomId === data.d.roomId) {
            consumeStream(data.d.consumerParameters, data.d.peerId, data.d.kind );
          } else {
            consumerQueue = [...consumerQueue, { roomId: data.d.roomId, d: data.d }];
          }
          break;
        case "active_speaker":
          console.log(data)
          if (data.value)
            useConsumerStore.getState().addActiveSpeaker(data.peerId)
          else
            useConsumerStore.getState().removeActiveSpeaker(data.peerId)
          break;
        case "toggle_peer_producer":
          console.log(data)
          if (data.kind === 'audio')
            useConsumerStore.getState().addAudioToggle(data.peerId, data.pause)
          else
            useConsumerStore.getState().addVideoToggle(data.peerId, data.pause)
          break;
        case "close_media":
          console.log(data)
          useConsumerStore.getState().closeMedia(data.peerId)
          break;
        default:
          const { handlerMap } = useWsHandlerStore.getState();
          if (data.topic in handlerMap) {
            handlerMap[data.topic](data.d);
          }
          break;
      }
    };

    socket.onclose = (event) => {
      if (event.wasClean) {
        console.info(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.info('[close] Connection died');
      }
    };

    socket.onerror = (error) => {
      console.error(`[error] ${error.message}`);
    };
  }

  return {socket, sendMovement, sendComms, joinRoom};
}

export const wsend = async (d) => {
  if (socket && socket.readyState === socket.OPEN) {
    await socket.send(JSON.stringify(d));
  }
};
