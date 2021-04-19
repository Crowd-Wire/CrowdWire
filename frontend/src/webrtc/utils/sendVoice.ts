import storeDevice from "../../redux/commStore.js";
import { useVoiceStore } from "../stores/useVoiceStore";

export const sendVoice = async () => {
  const { sendTransport, set, mic, micStream } = useVoiceStore.getState();
  const { micId } = storeDevice.getState().micId;
  
  if (!sendTransport) {
    console.log("no sendTransport in sendVoice");
    return;
  }
  if (!micStream) {
    try {
      set({
        micStream: await navigator.mediaDevices.getUserMedia({
          audio: micId ? { deviceId: micId } : true,
          video: false
        })
      });
      set({
        mic: micStream.getAudioTracks()[0]
      })
    } catch (err) {
      set({ mic: null, micStream: null });
      console.log(err);
      return;
    }
  } 

  if (mic) {
    console.log("creating producer...");
    sendTransport.produce({
      track: mic,
      appData: { mediaTag: "cam-audio" },
    }).then((producer) => {set({micProducer: producer})})
  }
};
