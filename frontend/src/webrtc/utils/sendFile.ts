import { useRoomStore } from "../stores/useRoomStore";
import { Producer, Transport } from "mediasoup-client/lib/types";

export const sendFile = async (roomId:string = null) => {
  const { rooms } = useRoomStore.getState();
  const dataProducers = [];

  if (roomId && !(roomId in rooms))
    return dataProducers;
  
  
  let sendTransports: Record<string,
    { recvTransport: Transport;
      sendTransport: Transport;
      micProducer: Producer;
      camProducer: Producer;
      mediaProducer: Producer;
    }> = {};
  
  sendTransports = rooms;

  if (Object.keys(sendTransports).length <= 0) {
    return;
  }
  
  for (const [ key, value ] of Object.entries(sendTransports)) {
    if (value && value.sendTransport) {

        var dataProducer = await value.sendTransport.produceData({
          appData: { mediaTag: "file" },
        })

        dataProducer.on("transportclose", () => {
          dataProducer.close();
        })

        dataProducers.push(dataProducer);
    }
  }
  return dataProducers;
};
