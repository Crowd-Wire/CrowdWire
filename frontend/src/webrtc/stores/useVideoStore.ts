import { Producer } from "mediasoup-client/lib/Producer";
import create from "zustand";
import { combine } from "zustand/middleware";

export const useVideoStore = create(
  combine(
    {
      camStream: null as MediaStream | null,
      cam: null as MediaStreamTrack | null,
    },
    (set) => ({
      nullify: () => {
        set((s) => {
          if (s.cam) s.cam.stop()
          return {
            cam: null,
            camStream: null,
          }
        })
      },
      set,
    })
  )
);
