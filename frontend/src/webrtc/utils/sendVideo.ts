import storeDevice from "../../redux/commStore.js";
import { useRoomStore } from "../stores/useRoomStore";
import { useVideoStore } from "../stores/useVideoStore";
import { useMuteStore } from "../stores/useMuteStore";
import { Producer, Transport } from "mediasoup-client/lib/types";

export const sendVideo = async (roomId:string = null) => {
  const { camId } = storeDevice.getState().camId;
  let { set, cam, camStream } = useVideoStore.getState();
  const { rooms, addProducer, removeProducer } = useRoomStore.getState();
  const { videoMuted } = useMuteStore.getState();
  
  if ( (roomId && !(roomId in rooms)) || videoMuted) {
    return;
  }
  
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
  
  if (!camStream) {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: camId ? { deviceId: camId } : true,
        audio: false
      }).then((camStream) => {
        set({camStream: camStream, cam: camStream.getVideoTracks()[0]})
      })
    } catch (err) {
      set({ cam: null, camStream: null });
      console.log(err);
    }
    return;
  }

  if (Object.keys(sendTransports).length <= 0) {
    console.log("no sendTransport in sendVoice");
    return;
  }
  
  if (cam) {
    console.log("creating producer...");
    for (const [ key, value ] of Object.entries(sendTransports)) {
      if (value && value.sendTransport) {
        await value.sendTransport.produce({
          track: cam,
          stopTracks: false,
          appData: { mediaTag: "video" },
        })
        .then((producer) => {
          addProducer(key, producer, 'cam');
          return
        })
        .catch((err) => {
          console.log(err)
        })

      }
    }
  }
};
