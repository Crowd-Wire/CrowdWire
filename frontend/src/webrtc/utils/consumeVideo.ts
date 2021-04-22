import { useConsumerStore } from "../stores/useConsumerStore";
import { useRoomStore } from "../stores/useRoomStore";

export const consumeVideo = async (consumerParameters: any, peerId: string) => {
  const { recvTransport } = useRoomStore.getState();
  if (!recvTransport) {
    console.log("skipping consumeVideo because recvTransport is null");
    return false;
  }
  console.log("new consumer" + peerId)
  console.log(consumerParameters.producerPaused)
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
  useConsumerStore.getState().addVideoToggle(peerId, consumerParameters.producerPaused);
  console.log(useConsumerStore.getState())
  return true;
};