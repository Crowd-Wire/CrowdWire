import { RtpCapabilities } from "mediasoup-client/lib/types";
import { useRoomStore } from "../stores/useRoomStore";

export const beforeJoinRoom = async (routerRtpCapabilities: RtpCapabilities, roomId) => {
  const { device } = useRoomStore.getState();
  console.log(useRoomStore.getState())
  useRoomStore.getState().addRoom(roomId)
  console.log(useRoomStore.getState())
  if (!device!.loaded) {
    await device!.load({ routerRtpCapabilities });
  }
};
