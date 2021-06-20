import storeDevice from "../../redux/commStore.js";
import { useMuteStore } from "../stores/useMuteStore";
import { useVoiceStore } from "../stores/useVoiceStore";
import { useRoomStore } from "../stores/useRoomStore";
import { Producer, Transport } from "mediasoup-client/lib/types";

export const sendVoice = async (roomId:string = null) => {
  const { micId } = storeDevice.getState().micId;
  let { set, mic, micStream } = useVoiceStore.getState();
  const { rooms, addProducer, removeProducer } = useRoomStore.getState();
  const { audioMuted } = useMuteStore.getState();

  if ( (roomId && !(roomId in rooms)) || audioMuted)
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

  if (!micStream) {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: micId ? { deviceId: micId } : true,
        video: false
      }).then((micStream) => {
        set({micStream: micStream, mic: micStream.getAudioTracks()[0]});
      })
    } catch (err) {
      set({ mic: null, micStream: null });
      console.error(err);
    }
    return;
  }

  if (Object.keys(sendTransports).length <= 0) {
    return;
  }
  
  if (mic) {
    for (const [ key, value ] of Object.entries(sendTransports)) {
      if (value && value.sendTransport) {
        await value.sendTransport.produce({
          track: mic,
          stopTracks: false,
          appData: { mediaTag: "audio" },
        }).then((producer) => {
          addProducer(key, producer, 'mic');
        })
        .catch((err) => {
          set({ mic: null, micStream: null });
          removeProducer(key, 'mic');
          console.error(err)
        })
      }
    }
  }
};
