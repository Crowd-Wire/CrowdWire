import storeDevice from "../../redux/commStore.js";
import { useMuteStore } from "../stores/useMuteStore";
import { useVoiceStore } from "../stores/useVoiceStore";
import { useRoomStore } from "../stores/useRoomStore";

export const sendVoice = async (roomId:string = null) => {
  const { micId } = storeDevice.getState().micId;
  let { set, mic, micStream } = useVoiceStore.getState();
  const { rooms, addProducer, removeProducer } = useRoomStore.getState();
  const { audioMuted } = useMuteStore.getState();

  if ( (roomId && !(roomId in rooms)) || audioMuted)
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

  if (!micStream) {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: micId ? { deviceId: micId } : true,
        video: false
      }).then((micStream) => {
        mic = micStream.getAudioTracks()[0];
        set({micStream: micStream, mic: mic});
      })
    } catch (err) {
      set({ mic: null, micStream: null });
      console.log(err);
      return;
    }
  }

  if (mic) {
    console.log("creating producer...");
    for (const [ key, value ] of Object.entries(sendTransports)) {
      //@ts-ignore
      if (value && value.sendTransport) {
        //@ts-ignore
        value.sendTransport.produce({
          track: mic,
          appData: { mediaTag: "audio" },
        }).then((producer) => {
          console.log(useRoomStore.getState())
          addProducer(key, producer, 'mic');
          console.log(useRoomStore.getState())
        })
        .catch((err) => {
          set({ mic: null, micStream: null });
          removeProducer(key, 'mic');
          console.log(err)
        })
      }
    }
  }
};
