import { useConsumerStore } from "../stores/useConsumerStore";
import { useVoiceStore } from "../stores/useVoiceStore";

export const consumeAudio = async (consumerParameters: any, peerId: string) => {
  const { recvTransport } = useVoiceStore.getState();
  if (!recvTransport) {
    console.log("skipping consumeAudio because recvTransport is null");
    return false;
  }
  console.log("new consumer" + peerId)
  console.log(consumerParameters.producerPaused)
  const consumer = await recvTransport.consume({
    ...consumerParameters,
    appData: {
      peerId,
      producerId: consumerParameters.producerId,
      mediaTag: "cam-audio",
      kind: "audio",
    },
  });
  useConsumerStore.getState().add(consumer, peerId, 'audio');
  useConsumerStore.getState().addAudioToggle(peerId, consumerParameters.producerPaused)
  console.log(useConsumerStore.getState())
  return true;
};
