import { useRoomStore } from "../stores/useRoomStore";
import { Transport } from "mediasoup-client/lib/Transport";

export const sendFile = async (roomId:string = null) => {
  const { rooms } = useRoomStore.getState();
  const dataProducers = [];

  if (roomId && !(roomId in rooms))
    return dataProducers;
  
  const sendTransports: Transport[] = [];


  if (roomId)
    sendTransports.push(rooms[roomId].sendTransport)
  else {
    for (let value of Object.values(rooms))
      sendTransports.push(value.sendTransport)
  }

  if (sendTransports.length <= 0) {
    return dataProducers;
  }

  for (let i = 0; i<sendTransports.length; i++) {
    if (sendTransports[i]) {
      console.log('producing data')

      var dataProducer = await sendTransports[i].produceData({
        appData: { mediaTag: "file" },
      })

      dataProducer.on("transportclose", () => {
        dataProducer.close();
      })

      dataProducers.push(dataProducer);
    }
  }
  console.log(dataProducers)
  return dataProducers;
};
