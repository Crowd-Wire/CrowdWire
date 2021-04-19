import storeDevice from "../../redux/commStore.js";
import { useVoiceStore } from "../stores/useVoiceStore";
import { useVideoStore } from "../stores/useVideoStore";

export const sendVideo = async () => {
  const { camId } = storeDevice.getState().camId;
  const { set, cam, camStream } = useVideoStore.getState();
  const { sendTransport } = useVoiceStore.getState();

  if (!sendTransport) {
    console.log("no sendTransport in sendVoice");
    return;
  }

  if (!camStream) {
    try {
      set({
        camStream: await navigator.mediaDevices.getUserMedia({
          video: camId ? { deviceId: camId } : true,
          audio: false
        })
      })
      set({
        cam: camStream.getVideoTracks()[0]
      })
    } catch (err) {
      set({ cam: null, camStream: null });
      console.log(err);
      return;
    }
  }

  if (cam) {
    console.log("creating producer...");
    sendTransport.produce({
      track: cam,
      appData: { mediaTag: "cam-video" },
    }).then((producer) => {set({camProducer: producer})})
  }
};
