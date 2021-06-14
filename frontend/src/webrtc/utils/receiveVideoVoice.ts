import { getSocket } from "../../services/socket";
import { useRoomStore } from "../stores/useRoomStore";
import useWorldUserStore from "../../stores/useWorldUserStore";

export const receiveVideoVoice = (roomId) => {
  var socket = getSocket(useWorldUserStore.getState().world_user.world_id).socket;
  socket.send(JSON.stringify({
    topic: "@get-recv-tracks",
    d: {
      roomId: roomId,
      rtpCapabilities: useRoomStore.getState().device!.rtpCapabilities,
    },
  }));
};
