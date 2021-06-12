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
          if (s.camStream) s.camStream.getTracks().forEach(track => track.stop())
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
