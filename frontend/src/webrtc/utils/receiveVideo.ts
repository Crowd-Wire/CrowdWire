import { getSocket } from "../../services/socket";
import { useVideoStore } from "../stores/useVideoStore";

export const receiveVideo = (roomId) => {
  var socket = getSocket(1).socket;

  socket.send(JSON.stringify({
    topic: "@get-recv-tracks",
    d: {
      roomId: roomId,
      rtpCapabilities: useVideoStore.getState().device!.rtpCapabilities,
    },
  }));
};
