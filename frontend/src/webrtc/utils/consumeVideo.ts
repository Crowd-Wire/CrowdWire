import { useConsumerStore } from "../stores/useConsumerStore";
import { useVoiceStore } from "../stores/useVoiceStore";

export const consumeVideo = async (consumerParameters: any, peerId: string) => {
  const { recvTransport } = useVoiceStore.getState();
  if (!recvTransport) {
    console.log("skipping consumeVideo because recvTransport is null");
    return false;
  }
  console.log("new consumer" + peerId)
  const consumer = await recvTransport.consume({
    ...consumerParameters,
    appData: {
      peerId,
      producerId: consumerParameters.producerId,
      mediaTag: "cam-video",
      kind: "video",
    },
  });
  useConsumerStore.getState().add(consumer, peerId, 'video');
  console.log(useConsumerStore.getState())
  return true;
};
