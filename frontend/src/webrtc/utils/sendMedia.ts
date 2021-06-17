import { useRoomStore } from "../stores/useRoomStore";
import { useMediaStore } from "../stores/useMediaStore";
import useWorldUserStore from "stores/useWorldUserStore";
import { Producer, Transport } from "mediasoup-client/lib/types";


export const sendMedia = async (to_create_new: boolean, roomId: string = null) => {
  let { set, media, mediaStream } = useMediaStore.getState();
  const { rooms, addProducer, removeProducer } = useRoomStore.getState();
  
  if (!to_create_new && !mediaStream)
    return;

  if (roomId && !(roomId in rooms))
    return;
  
  let sendTransports: Record<string,
    { recvTransport: Transport;
      sendTransport: Transport;
      micProducer: Producer;
      camProducer: Producer;
      mediaProducer: Producer;
    }> = {};

  if (roomId){
    sendTransports[roomId] = rooms[roomId]
  } else {
    sendTransports = rooms;
  }

  
  if (!mediaStream) {
    try {
      // @ts-ignore
      await navigator.mediaDevices.getDisplayMedia().then((mediaStream) => {
        media = mediaStream.getVideoTracks()[0];
        media.onended = function(event) {
          let { rooms } = useRoomStore.getState();
          if (Object.keys(rooms).length > 0) {
            for (const [key, value] of Object.entries(rooms)) {
              removeProducer(key, 'media');
            }
          }
          if (media) media.stop();
          if (mediaStream) mediaStream.getTracks().forEach(track => track.stop())
          set({media: null, mediaStream: null});
          useWorldUserStore.getState().setShowMedia(false);
        }
        
        set({mediaStream: mediaStream, media: media})
      })
    } catch (err) {
      set({media: null, mediaStream: null})
      console.log(err);
    }
    return;
  }

  if (Object.keys(sendTransports).length <= 0) {
    return;
  }
  
  if (media) {
    try {
      console.log("creating producer...");
      for (const [ key, value ] of Object.entries(sendTransports)) {
        if (value && value.sendTransport) {
          await value.sendTransport.produce({
            track: media,
            stopTracks: false,
            appData: { mediaTag: "media" },
          })
          .then((producer) => {
            addProducer(key, producer, 'media');
          })
          .catch((err) => {
            console.log(err)
            let { rooms } = useRoomStore.getState();
            if (Object.keys(rooms).length > 0) {
              for (const [key, value] of Object.entries(rooms)) {
                removeProducer(key, 'media');
              }
            }
            if (media) media.stop();
            if (mediaStream) mediaStream.getTracks().forEach(track => track.stop())
            set({media: null, mediaStream: null});
            useWorldUserStore.getState().setShowMedia(false);
          })
        }
      };
      return true;
    } catch (err) {
      console.log(err)
    }
  }
};
