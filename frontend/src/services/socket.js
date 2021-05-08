import { WS_BASE } from "config";
import { createTransport } from "../webrtc/utils/createTransport";
import { sendVoice } from "../webrtc/utils/sendVoice";
import { sendVideo } from "../webrtc/utils/sendVideo";
import { beforeJoinRoom } from "../webrtc/utils/beforeJoinRoom";
import { consumeStream } from "../webrtc/utils/consumeStream";
import { receiveVideoVoice } from "../webrtc/utils/receiveVideoVoice";
import { useRoomStore } from "../webrtc/stores/useRoomStore";
import { useConsumerStore } from "../webrtc/stores/useConsumerStore";
import { useWsHandlerStore } from "../webrtc/stores/useWsHandlerStore";
import AuthenticationService from "services/AuthenticationService";

import usePlayerStore from "stores/usePlayerStore.ts";
import useMessageStore from "stores/useMessageStore.ts";
import GameScene from "phaser/GameScene";

// let commSocket;

// export const getCommSocket = () => {
//   if (!commSocket)
//     commSocket = new WebSocket(`${WS_BASE}/?`);
//   return commSocket;
// }

async function flushConsumerQueue(_roomId) {
  try {
    for (const {
      roomId,
      d: { peerId, consumerParameters },
    } of consumerQueue) {
      if (_roomId === roomId) {
        await consumeStream(consumerParameters, roomId, peerId, consumerParameters.kind,)
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
    console.log(consumerParametersArr)
    for (const { consumer, kind } of consumerParametersArr) {
      if (!(await consumeStream(consumer.consumerParameters, consumer.roomId, consumer.peerId, kind))) {
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

  const wirePlayer = async (roomId, usersId) => {
    const payload = {
      topic: "WIRE_PLAYER",
      // room_id: roomId,
      users_id: usersId,
    }
    if (socket.readyState === WebSocket.OPEN)
      await socket.send(JSON.stringify(payload));
    else
      console.error(`[error] socket closed before wirePlayer`);
  }

  const unwirePlayer = async (roomId, usersId) => {
    const payload = {
      topic: "UNWIRE_PLAYER",
      // room_id: roomId,
      users_id: usersId,
    }
    if (socket.readyState === WebSocket.OPEN)
      await socket.send(JSON.stringify(payload));
    else
      console.error(`[error] socket closed before unwirePlayer`);
  }

  const sendMessage = async (message, to) => {
    console.log(message, to);
    const payload = {
      topic: "SEND_MESSAGE",
      text: message,
      to,
    }
    if (socket.readyState === WebSocket.OPEN)
      await socket.send(JSON.stringify(payload));
    else
      console.error(`[error] socket closed before sendMessage`);
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
      const token = AuthenticationService.getToken();
      socket = new WebSocket(`${WS_BASE}/ws/${worldId}?token=${token}`);

      socket.onopen = async (event) => {
          console.info("[open] Connection established");
          const heartbeat = setInterval(() => {
              if (socket && socket.readyState === socket.OPEN) {
                socket.send(JSON.stringify({'topic': 'PING'}));
              } else {
                // reopen web socket maybe?
                // or ask for new tokens if thats the case
                clearInterval(heartbeat);
              }
          }, 5000);
          await socket.send(JSON.stringify({token: '', room_id: '1'}));
      };

    socket.onmessage = (event) => {
      if (event.data == "PONG") {
        console.log(event.data)
        return
      }

      var data = JSON.parse(event.data);

      console.info(`[message] Data received for topic ${data.topic}`);

      switch (data.topic) {
        case "SEND_MESSAGE":
            console.log('RECV_MSG', data.text);
            useMessageStore.getState().addMessage({text: data.text, date: data.date});
            break;
        case "JOIN_PLAYER":
            usePlayerStore.getState().connectPlayer(data.user_id, data.position);
            break;
        case "LEAVE_PLAYER":
            useConsumerStore.getState().closePeer(data.user_id);
            usePlayerStore.getState().disconnectPlayer(data.user_id);
            break;
        case "PLAYER_MOVEMENT":
            console.log('\nRECV',data.position, data.velocity)
            usePlayerStore.getState().movePlayer(data.user_id, data.position, data.velocity);
            break;
        case "PLAYERS_SNAPSHOT":
            usePlayerStore.getState().connectPlayers(data.snapshot);
            break;
        case "GROUPS_SNAPSHOT":
            usePlayerStore.getState().setGroups(data.groups);
            break;
        case "you-joined-as-peer":
          console.log(data)
          beforeJoinRoom(data.d.routerRtpCapabilities, data.d.roomId).then(() => {
              createTransport(data.d.roomId, "recv", data.d.recvTransportOptions).then(() => {
                receiveVideoVoice(data.d.roomId, () => flushConsumerQueue(data.d.roomId));
              })
              createTransport(data.d.roomId, "send", data.d.sendTransportOptions).then(() => {
                sendVideo(data.d.roomId);
              });
          })
          break;
        case "you-joined-as-speaker":
          console.log(data)
          beforeJoinRoom(data.d.routerRtpCapabilities, data.d.roomId).then(() => {
              createTransport(data.d.roomId, "recv", data.d.recvTransportOptions).then(() => {
                receiveVideoVoice(data.d.roomId, () => flushConsumerQueue(data.d.roomId));
              })
              createTransport(data.d.roomId, "send", data.d.sendTransportOptions).then(() => {
                sendVoice(data.d.roomId);
                sendVideo(data.d.roomId);
              });
          })
          break;
        case "@get-recv-tracks-done":
          console.log(data)
          consumeAll(data.d.consumerParametersArr);
          break;
        case "new-peer-producer":
          console.log(data)
          // check if tile im currently on is a conference type or not
          // else check if player is in range
          console.log(GameScene.inRangePlayers.has(data.d.peerId))
          if (GameScene.inRangePlayers.has(data.d.peerId)) {
            const roomId = data.d.roomId;
            if (useRoomStore.getState().rooms[roomId].recvTransport) {
              consumeStream(data.d.consumerParameters, roomId, data.d.peerId, data.d.kind );
            } else {
              consumerQueue = [...consumerQueue, { roomId: roomId, d: data.d }];
            }
          }
          break;
        case "active-speaker":
          console.log(data)
          if (data.value)
            useConsumerStore.getState().addActiveSpeaker(data.peerId)
          else
            useConsumerStore.getState().removeActiveSpeaker(data.peerId)
          break;
        case "toggle-peer-producer":
          console.log(data)
          if (data.kind === 'audio')
            useConsumerStore.getState().addAudioToggle(data.peerId, data.pause)
          else
            useConsumerStore.getState().addVideoToggle(data.peerId, data.pause)
          break;
        case "close-media":
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

  return {socket, sendMovement, sendComms, joinRoom, wirePlayer, unwirePlayer, sendMessage};
}

export const wsend = async (d) => {
  if (socket && socket.readyState === socket.OPEN) {
    await socket.send(JSON.stringify(d));
  }
};

function heartbeat() {
  if (socket && socket.readyState === socket.OPEN) {
    socket.send("heartbeat");
  }
  setTimeout(heartbeat, 500);
}
