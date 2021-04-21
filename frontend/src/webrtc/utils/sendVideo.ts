import storeDevice from "../../redux/commStore.js";
import { useRoomStore } from "../stores/useRoomStore";
import { useVideoStore } from "../stores/useVideoStore";
import { useMuteStore } from "../stores/useMuteStore";

export const sendVideo = async () => {
  const { camId } = storeDevice.getState().camId;
  let { set, cam, camStream } = useVideoStore.getState();
  const { sendTransport, roomId } = useRoomStore.getState();
  const { videoMuted } = useMuteStore.getState();
  
  if (!roomId || videoMuted)
    return;

  if (!sendTransport) {
    console.log("no sendTransport in sendVoice");
    return;
  }

  if (!camStream) {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: camId ? { deviceId: camId } : true,
        audio: false
      }).then((camStream) => {
        cam = camStream.getVideoTracks()[0];
        set({camStream: camStream, cam: cam})
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
      appData: { mediaTag: "video" },
    }).then((producer) => {set({camProducer: producer})})
  }
};
