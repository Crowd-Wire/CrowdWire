import hark from "hark";
import React, { useEffect } from "react";
// import { useCurrentRoomStore } from "../stores/useCurrentRoomStore";
import { useVoiceStore } from "../stores/useVoiceStore";
import { useRoomStore } from "../stores/useRoomStore";
import { wsend } from "../../services/socket.js";

interface ActiveSpeakerListenerProps {}

export const ActiveSpeakerListener: React.FC<ActiveSpeakerListenerProps> = ({}) => {
  const isSafari = window['safari'] || navigator.userAgent.toLowerCase().indexOf("Safari") > -1;
  
  useEffect(() => {
    let { micStream } = useVoiceStore();
    let { roomId } = useRoomStore();

    if (!roomId || !micStream || isSafari) {
      return;
    }

    const harker = hark(micStream, { threshold: -65, interval: 75 });

    harker.on("speaking", () => {
        wsend({ topic: "speaking_change", d: { roomId: roomId, value: true } });
    });

    harker.on("stopped_speaking", () => {
        wsend({ topic: "speaking_change", d: { roomId: roomId, value: false } });
    });

    return () => {
      harker.stop();
    };
  }, [useVoiceStore.getState().micStream, useRoomStore.getState().roomId]);

  return null;
};