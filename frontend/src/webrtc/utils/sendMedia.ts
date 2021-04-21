import { useRoomStore } from "../stores/useRoomStore";
import { useMediaStore } from "../stores/useMediaStore";

export const sendMedia = async () => {
  let { set, media, mediaStream } = useMediaStore.getState();
  const { sendTransport, roomId } = useRoomStore.getState();
  
  if (!roomId)
    return;

  if (!sendTransport) {
    console.log("no sendTransport in sendVoice");
    return;
  }

  if (!mediaStream) {
    try {
      // @ts-ignore
      await navigator.mediaDevices.getDisplayMedia().then((mediaStream) => {
        media = mediaStream.getVideoTracks()[0];
        set({mediaStream: mediaStream, media: media})
      })
    } catch (err) {
      set({ media: null, mediaStream: null });
      console.log(err);
      return;
    }
  }

  if (media) {
    console.log("creating producer...");
    sendTransport.produce({
      track: media,
      appData: { mediaTag: "media" },
    }).then((producer) => {set({mediaProducer: producer})})
  }
};
