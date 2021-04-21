import create from "zustand";
import { combine } from "zustand/middleware";

export const useVoiceStore = create(
  combine(
    {
      micStream: null as MediaStream | null,
      mic: null as MediaStreamTrack | null,
      micProducer: null as any | null,
    },
    (set) => ({
      nullify: () =>
        set({
          mic: null,
          micStream: null,
          micProducer: null,
        }),
      set,
    })
  )
);
