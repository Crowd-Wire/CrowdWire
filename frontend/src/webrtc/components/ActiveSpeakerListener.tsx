import hark from "hark";
import React, { useEffect } from "react";
// import { useCurrentRoomStore } from "../stores/useCurrentRoomStore";
import { useVoiceStore } from "../stores/useVoiceStore";
import { wsend } from "../../services/socket.js";

interface ActiveSpeakerListenerProps {}

export const ActiveSpeakerListener: React.FC<ActiveSpeakerListenerProps> = ({}) => {
  const { micStream, roomId } = useVoiceStore();
  
  useEffect(() => {
    if (!roomId || !micStream) {
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
  }, [micStream, roomId]);

  return null;
};