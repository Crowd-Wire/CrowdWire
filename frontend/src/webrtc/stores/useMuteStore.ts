import create from "zustand";
import { combine } from "zustand/middleware";

export const useMuteStore = create(
  combine(
    {
      muted: false,
    },
    (set) => ({
      setMute: (muted: boolean) => {
        set({ muted });
      },
    })
  )
);
