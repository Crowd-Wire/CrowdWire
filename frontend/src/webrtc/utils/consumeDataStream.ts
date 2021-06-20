import { Transport } from "mediasoup-client/lib/Transport";
import { useConsumerStore } from "../stores/useConsumerStore";
import { useRoomStore } from "../stores/useRoomStore";

export const consumeDataStream = async (consumerParameters: any, roomId: string, peerId: string) => {
  const { rooms } = useRoomStore.getState();

  if (!(roomId in rooms)) {
    return false;
  }

  let recvTransport: Transport = rooms[roomId].recvTransport;

  if (!recvTransport) {
    return false;
  }
  
  const dataConsumer = await recvTransport.consumeData({
    ...consumerParameters,
    appData: {
      peerId,
      dataProducerId: consumerParameters.producerId,
    },
  });

  useConsumerStore.getState().addDataConsumer(dataConsumer, peerId, roomId);

  return true;
};
