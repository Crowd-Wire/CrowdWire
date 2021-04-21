import create from "zustand";
import { combine } from "zustand/middleware";
import { Device } from "mediasoup-client";
import { detectDevice, Transport } from "mediasoup-client/lib/types";

export const getDevice = () => {
  try {
    let handlerName = detectDevice();
    if (!handlerName) {
      console.warn(
        "mediasoup does not recognize this device, so ben has defaulted it to Chrome74"
      );
      handlerName = "Chrome74";
    }
    return new Device({ handlerName });
  } catch {
    return null;
  }
};

export const useRoomStore = create(
  combine(
    {
      roomId: null as string | null,
      recvTransport: null as Transport | null,
      sendTransport: null as Transport | null,
      device: getDevice(),
    },
    (set) => ({
      nullify: () =>
        set({
          roomId: null,
          recvTransport: null,
          sendTransport: null,
        }),
      set,
    })
  )
);
