import { Device } from "mediasoup-client";
import { detectDevice, Transport } from "mediasoup-client/lib/types";
import create from "zustand";
import { combine } from "zustand/middleware";

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

export const useVideoStore = create(
  combine(
    {
      roomId: "",
      camStream: null as MediaStream | null,
      cam: null as MediaStreamTrack | null,
      device: getDevice(),
    },
    (set) => ({
      nullify: () =>
        set({
          roomId: "",
          cam: null,
          camStream: null,
        }),
      set,
    })
  )
);
