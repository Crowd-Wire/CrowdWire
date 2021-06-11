import { useRoomStore } from "../stores/useRoomStore";
import { useMediaStore } from "../stores/useMediaStore";

export const sendMedia = async (roomId:string = null) => {
  let { set, media, mediaStream } = useMediaStore.getState();
  const { rooms, addProducer, removeProducer } = useRoomStore.getState();
  
  if (roomId && !(roomId in rooms))
    return;
  
  let sendTransports: {} = {};

  if (roomId)
    sendTransports = { roomId: rooms[roomId].sendTransport }
  else {
    sendTransports = rooms;
  }

  if (Object.keys(sendTransports).length <= 0) {
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
      set({media: null, mediaStream: null})
      console.log(err);
      return;
    }
  }

  if (media) {
    try {
      console.log("creating producer...");
      for (const [ key, value ] of Object.entries(sendTransports)) {
        //@ts-ignore
        if (value && value.sendTransport) {
          //@ts-ignore
          value.sendTransport.produce({
            track: media,
            appData: { mediaTag: "media" },
          })
          .then((producer) => {
            addProducer(key, producer, 'media');
          })
          .catch((err) => {
            console.log(err)
            removeProducer(key, 'media');
            set({media: null, mediaStream: null})
          })
        }
      };
      media.onended = function(event) {
        let { rooms } = useRoomStore.getState();
        if (Object.keys(rooms).length > 0) {
          for (const [key, value] of Object.entries(rooms)) {
            removeProducer(key, 'media');
          }
        }
        set({media: null, mediaStream: null})
      }
      return true;
    } catch (err) {
      console.log(err)
    }
  }
};
