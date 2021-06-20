import { RtpCapabilities } from "mediasoup-client/lib/types";
import { useRoomStore } from "../stores/useRoomStore";

export const beforeJoinRoom = async (routerRtpCapabilities: RtpCapabilities, roomId, inRoom?: false) => {
  const { device } = useRoomStore.getState();
  if (!inRoom) {
    useRoomStore.getState().addRoom(roomId);
  }

  if (!device!.loaded) {
    await device!.load({ routerRtpCapabilities });
  }
};
