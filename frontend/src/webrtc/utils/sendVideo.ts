import storeDevice from "../../redux/commStore.js";
import { useRoomStore } from "../stores/useRoomStore";
import { useVideoStore } from "../stores/useVideoStore";
import { useMuteStore } from "../stores/useMuteStore";
import { Transport } from "mediasoup-client/lib/Transport";

export const sendVideo = async (roomId:string = null) => {
  const { camId } = storeDevice.getState().camId;
  let { set, cam, camStream } = useVideoStore.getState();
  const { rooms } = useRoomStore.getState();
  const { videoMuted } = useMuteStore.getState();
  
  if ( (roomId && !(roomId in rooms)) || videoMuted)
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
    sendTransports.forEach(function (sendTransport) {
      if (sendTransport) {
        sendTransport.produce({
          track: cam,
          appData: { mediaTag: "video" },
        })
        .then((producer) => {
          set({camProducer: producer})
          producer.on("transportclose", () => {
            producer.close();
            set({cam: null, camStream: null, camProducer: null})
          })
        })
        .catch((err) => {
          console.log(err)
          cam.onended = function(event) {
            useVideoStore.getState().camProducer.close();
            set({cam: null, camStream: null, camProducer: null})
          }
        })
      }
    });

  }
};
