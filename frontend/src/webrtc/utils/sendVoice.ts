import storeDevice from "../../redux/commStore.js";
import { useVoiceStore } from "../stores/useVoiceStore";

export const sendVoice = async () => {
  const { micId } = storeDevice.getState().micId;
  const { sendTransport, set, mic, micStream, roomId } = useVoiceStore.getState();

  if (!roomId)
    return;

  if (!sendTransport) {
    console.log("no sendTransport in sendVoice");
    return;
  }
  if (!micStream) {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: micId ? { deviceId: micId } : true,
        video: false
      }).then((micStream) => {
        set({micStream: micStream, mic: micStream.getVideoTracks()[0]})
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
