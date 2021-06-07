import create from "zustand";
import { combine } from "zustand/middleware";

export const useVideoStore = create(
  combine(
    {
      camStream: null as MediaStream | null,
      cam: null as MediaStreamTrack | null,
      camProducer: null as any | null,
    },
    (set) => ({
      nullify: () => {
        set((s) => {
          if (s.cam) s.cam.stop()
          return {
            cam: null,
            camStream: null,
            camProducer: null,
          }
        })
      },
      set,
    })
  )
);
