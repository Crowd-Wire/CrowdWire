import storeDevice from "../../redux/commStore.js";
import { useMuteStore } from "../stores/useMuteStore";
import { useVoiceStore } from "../stores/useVoiceStore";
import { useRoomStore } from "../stores/useRoomStore";
import { Transport } from "mediasoup-client/lib/Transport";

export const sendVoice = async (roomId:string = null) => {
  const { micId } = storeDevice.getState().micId;
  let { set, mic, micStream } = useVoiceStore.getState();
  const { rooms } = useRoomStore.getState();
  const { audioMuted } = useMuteStore.getState();

  if ( (roomId && !(roomId in rooms)) || audioMuted)
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
    sendTransports.forEach(function (sendTransport) {
      sendTransport.produce({
        track: mic,
        appData: { mediaTag: "audio" },
      }).then((producer) => {set({micProducer: producer})})
    });
  }
};
