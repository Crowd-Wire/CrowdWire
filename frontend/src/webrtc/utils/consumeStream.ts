import { useConsumerStore } from "../stores/useConsumerStore";
import { useRoomStore } from "../stores/useRoomStore";

export const consumeStream = async (consumerParameters: any, peerId: string, kind: string) => {
  const { recvTransport } = useRoomStore.getState();
  if (!recvTransport) {
    console.log("skipping consumeStream because recvTransport is null");
    return false;
  }
  console.log("new consumer" + peerId)

  const consumer = await recvTransport.consume({
    ...consumerParameters,
    appData: {
      peerId,
      producerId: consumerParameters.producerId,
      mediaTag: kind,
      kind: kind,
    },
  });
  console.log(consumer)
  useConsumerStore.getState().add(consumer, peerId, kind);
  
  if (kind == 'audio')
    useConsumerStore.getState().addAudioToggle(peerId, consumerParameters.producerPaused)
  else if (kind == 'video')
    useConsumerStore.getState().addVideoToggle(peerId, consumerParameters.producerPaused);
  
  console.log(useConsumerStore.getState())
  return true;
};
