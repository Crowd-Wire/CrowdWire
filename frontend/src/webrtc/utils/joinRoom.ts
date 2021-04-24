import { RtpCapabilities } from "mediasoup-client/lib/types";
import { useRoomStore } from "../stores/useRoomStore";

export const joinRoom = async (routerRtpCapabilities: RtpCapabilities) => {
  const { device } = useRoomStore.getState();
  if (!device!.loaded) {
    await device!.load({ routerRtpCapabilities });
  }
};
