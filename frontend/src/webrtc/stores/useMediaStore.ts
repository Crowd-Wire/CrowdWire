import create from "zustand";
import { combine } from "zustand/middleware";

export const useMediaStore = create(
  combine(
    {
      mediaStream: null as MediaStream | null,
      media: null as MediaStreamTrack | null,
      mediaProducer: null as any | null,
    },
    (set) => ({
      nullify: () => {
        set((s) => {
          if (s.media) s.media.stop()
          return {
            media: null,
            mediaStream: null,
            mediaProducer: null,
          }
        })
      },
      set,
    })
  )
);
