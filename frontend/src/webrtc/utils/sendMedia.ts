import { useRoomStore } from "../stores/useRoomStore";
import { useMediaStore } from "../stores/useMediaStore";
import { Transport } from "mediasoup-client/lib/Transport";

export const sendMedia = async (roomId:string = null) => {
  let { set, media, mediaStream } = useMediaStore.getState();
  const { rooms } = useRoomStore.getState();

  
  if (roomId && !(roomId in rooms))
    return;
  
  const sendTransports: Transport[] = [];

  if (roomId)
    sendTransports.push(rooms[roomId].sendTransport)
  else {
    for (let value of Object.values(rooms))
      sendTransports.push(value.sendTransport)
  }

  if (sendTransports.length <= 0) {
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
    try {
      console.log("creating producer...");
      sendTransports.forEach(function (sendTransport) {
        if (sendTransport) {
          sendTransport.produce({
            track: media,
            appData: { mediaTag: "media" },
          })
          .then((producer) => {
            set({mediaProducer: producer});
            producer.on("transportclose", () => {
              producer.close();
              set({media: null, mediaStream: null, mediaProducer: null});
            })
          })
          .catch((err) => console.log(err))
        }
      });
      media.onended = function(event) {
        useMediaStore.getState().mediaProducer.close();
        set({media: null, mediaStream: null, mediaProducer: null})
      }
      return true;
    } catch (err) {
      console.log(err)
    }
  }
};
