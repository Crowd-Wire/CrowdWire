import { Transport } from "mediasoup-client/lib/Transport";
import GameScene from "phaser/GameScene";
import { useConsumerStore } from "../stores/useConsumerStore";
import { useRoomStore } from "../stores/useRoomStore";

export const consumeStream = async (consumerParameters: any, roomId: string, peerId: string, kind: string) => {
  const { rooms } = useRoomStore.getState();

  if (!(roomId in rooms)) {
    console.log("skipping consumeStream because room doesn't exist");
    return false;
  }

  let recvTransport: Transport = rooms[roomId].recvTransport;

  if (!recvTransport) {
    console.log("skipping consumeStream because recvTransport is null");
    return false;
  }

  if (!GameScene.inRangePlayers.has(peerId)) {
    console.log("skipping consumeStream because player not in range");
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

  useConsumerStore.getState().add(consumer, roomId, peerId, kind);

  if (kind === 'audio')
    useConsumerStore.getState().addAudioToggle(peerId, consumerParameters.producerPaused)
  else if (kind === 'video')
    useConsumerStore.getState().addVideoToggle(peerId, consumerParameters.producerPaused);
  
  console.log(useConsumerStore.getState())
  return true;
};
