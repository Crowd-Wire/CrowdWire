import storeDevice from "../../redux/commStore.js";
import { useProducerStore } from "../stores/useProducerStore";
import { useVoiceStore } from "../stores/useVoiceStore";

export const sendVoice = async () => {
  const { micId } = storeDevice.getState().micId;
  const { sendTransport, set, mic } = useVoiceStore.getState();
  if (!sendTransport) {
    console.log("no sendTransport in sendVoice");
    return;
  }
  mic?.stop();
  let micStream: MediaStream;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: micId ? { deviceId: micId } : true,
      video: false
    });
  } catch (err) {
    set({ mic: null, micStream: null });
    console.log(err);
    return;
  }

  const audioTracks = micStream.getAudioTracks();

  if (audioTracks.length) {
    console.log("creating producer...");
    const track = audioTracks[0];
    await sendTransport.produce({
      track: track,
      appData: { mediaTag: "cam-audio" },
    })
    set({ mic: track, micStream });
    return;
  }

  set({ mic: null, micStream: null });
};
