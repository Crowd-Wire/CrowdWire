import { getSocket } from "../../services/socket";
import { useVoiceStore } from "../stores/useVoiceStore";

export const receiveVideoVoice = (roomId) => {
  var socket = getSocket(1).socket;

  socket.send(JSON.stringify({
    topic: "@get-recv-tracks",
    d: {
      roomId: roomId,
      rtpCapabilities: useVoiceStore.getState().device!.rtpCapabilities,
    },
  }));
};
