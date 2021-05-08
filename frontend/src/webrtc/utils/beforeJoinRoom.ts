import { RtpCapabilities } from "mediasoup-client/lib/types";
import { useRoomStore } from "../stores/useRoomStore";

export const beforeJoinRoom = async (routerRtpCapabilities: RtpCapabilities, roomId) => {
  const { device } = useRoomStore.getState();
  useRoomStore.getState().addRoom(roomId)
  if (!device!.loaded) {
    await device!.load({ routerRtpCapabilities });
  }
};
