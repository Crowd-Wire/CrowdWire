import { Producer } from "mediasoup-client/lib/Producer";
import create from "zustand";
import { combine } from "zustand/middleware";

export const useVoiceStore = create(
  combine(
    {
      micStream: null as MediaStream | null,
      mic: null as MediaStreamTrack | null,
    },
    (set) => ({
      nullify: () => {
        set((s) => {
          if (s.micStream) s.micStream.getTracks().forEach(track => track.stop())
          return {
            mic: null,
            micStream: null,
          }
        })
      },
      set,
    })
  )
);
