import { getSocket } from "../../services/socket";
import { useRoomStore } from "../stores/useRoomStore";

export const receiveVideoVoice = (roomId) => {
  var socket = getSocket(1).socket;

  socket.send(JSON.stringify({
    topic: "@get-recv-tracks",
    d: {
      roomId: roomId,
      rtpCapabilities: useRoomStore.getState().device!.rtpCapabilities,
    },
  }));
};
