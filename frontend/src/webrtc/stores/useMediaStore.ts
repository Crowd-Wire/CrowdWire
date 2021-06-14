import create from "zustand";
import { combine } from "zustand/middleware";

export const useMediaStore = create(
  combine(
    {
      mediaStream: null as MediaStream | null,
      media: null as MediaStreamTrack | null,
    },
    (set) => ({
      nullify: () => {
        set((s) => {
          if (s.mediaStream) s.mediaStream.getTracks().forEach(track => track.stop())
          return {
            media: null,
            mediaStream: null,
          }
        })
      },
      set,
    })
  )
);
