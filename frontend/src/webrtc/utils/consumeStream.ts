import { Transport } from "mediasoup-client/lib/Transport";
import GameScene from "phaser/scenes/GameScene.js";
import { useConsumerStore } from "../stores/useConsumerStore";
import { useRoomStore } from "../stores/useRoomStore";
import useWorldUserStore from "../../stores/useWorldUserStore";

export const consumeStream = async (consumerParameters: any, roomId: string, peerId: string, kind: string) => {
  const { rooms } = useRoomStore.getState();

  if (!(roomId in rooms)) {
    return false;
  }

  let recvTransport: Transport = rooms[roomId].recvTransport;

  if (!recvTransport) {
    return false;
  }

  if (!GameScene.inRangePlayers.has(peerId) && !useWorldUserStore.getState().world_user.in_conference) {
    return false;
  }
  
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

  return true;
};
