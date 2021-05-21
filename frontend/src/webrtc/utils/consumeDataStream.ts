import { Transport } from "mediasoup-client/lib/Transport";
import { useConsumerStore } from "../stores/useConsumerStore";
import { useRoomStore } from "../stores/useRoomStore";

export const consumeDataStream = async (consumerParameters: any, roomId: string, peerId: string) => {
  const { rooms } = useRoomStore.getState();

  if (!(roomId in rooms)) {
    console.log("skipping consumeDataStream because room doesn't exist");
    return false;
  }

  let recvTransport: Transport = rooms[roomId].recvTransport;

  if (!recvTransport) {
    console.log("skipping consumeDataStream because recvTransport is null");
    return false;
  }
  
  console.log("new consumer" + peerId)
  console.log(consumerParameters)
  const dataConsumer = await recvTransport.consumeData({
    ...consumerParameters,
    appData: {
      peerId,
      dataProducerId: consumerParameters.producerId,
    },
  });

  useConsumerStore.getState().addDataConsumer(dataConsumer, peerId);

  console.log(useConsumerStore.getState())
  return true;
};
