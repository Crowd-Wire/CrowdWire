import create from "zustand";
import { combine } from "zustand/middleware";

export const useMuteStore = create(
  combine(
    {
      audioMuted: true,
      videoMuted: true,
    },
    (set) => ({
      setAudioMute: (muted: boolean) => {
        set({ audioMuted: muted });
      },
      setVideoMute: (muted: boolean) => {
        set({ videoMuted: muted });
      },
    })
  )
);
