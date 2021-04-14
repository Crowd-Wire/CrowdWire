import storeDevice from "../../redux/commStore.js";
import { useVoiceStore } from "../stores/useVoiceStore";
import { useVideoStore } from "../stores/useVideoStore";

export const sendVoice = async () => {
  const { camId } = storeDevice.getState().camId;
  const { set, cam } = useVideoStore.getState();
  const { sendTransport } = useVoiceStore.getState();
  if (!sendTransport) {
    console.log("no sendTransport in sendVoice");
    return;
  }
  cam?.stop();
  let camStream: MediaStream;
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: camId ? { deviceId: camId } : true,
      audio: false
    });
  } catch (err) {
    set({ cam: null, camStream: null });
    console.log(err);
    return;
  }

  const videoTracks = camStream.getVideoTracks();

  if (videoTracks.length) {
    console.log("creating producer...");
    const track = videoTracks[0];
    await sendTransport.produce({
      track: track,
      appData: { mediaTag: "cam-video" },
    })
    set({ cam: track, camStream });
    return;
  }

  set({ cam: null, camStream: null });
};
