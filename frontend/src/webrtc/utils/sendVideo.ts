import storeDevice from "../../redux/commStore.js";
import { useRoomStore } from "../stores/useRoomStore";
import { useVideoStore } from "../stores/useVideoStore";
import { useMuteStore } from "../stores/useMuteStore";

export const sendVideo = async (roomId:string = null) => {
  const { camId } = storeDevice.getState().camId;
  let { set, cam, camStream } = useVideoStore.getState();
  const { rooms, addProducer, removeProducer } = useRoomStore.getState();
  const { videoMuted } = useMuteStore.getState();
  
  if ( (roomId && !(roomId in rooms)) || videoMuted)
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
    for (const [ key, value ] of Object.entries(sendTransports)) {
      //@ts-ignore
      if (value && value.sendTransport) {
        //@ts-ignore
        value.sendTransport.produce({
          track: cam,
          appData: { mediaTag: "video" },
        })
        .then((producer) => {
          console.log(useRoomStore.getState())
          addProducer(key, producer, 'cam');
          console.log(useRoomStore.getState())
        })
        .catch((err) => {
          set({ cam: null, camStream: null });
          removeProducer(key, 'cam');
          console.log(err)
        })

      }
    }
  }
};
