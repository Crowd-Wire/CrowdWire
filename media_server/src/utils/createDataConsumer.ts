import {
    DataConsumerType,
    DataProducer,
    SctpStreamParameters,
    Transport,
  } from "mediasoup/lib/types";
  import { MyPeer } from "../MyPeer";
  
  export const createDataConsumer = async (
    producer: DataProducer,
    transport: Transport,
    peerId: string,
    peerConsuming: MyPeer
  ): Promise<DataConsumer> => {
    const consumer = await transport.consumeData({
      dataProducerId: producer.id,
      ordered: true,
      appData: { peerId, mediaPeerId: producer.appData.peerId },
    });
  
    peerConsuming.consumers.push(consumer);
  
    return {
      peerId: producer.appData.peerId,
      consumerParameters: {
        dataProducerId: producer.id,
        id: consumer.id,
        sctpStreamParameters: producer.sctpStreamParameters!,
        type: consumer.type,
      },
    };
  };
  
  export interface DataConsumer {
    peerId: string;
    consumerParameters: {
      dataProducerId: string;
      sctpStreamParameters: SctpStreamParameters;
      id: string;
      type: DataConsumerType;
    };
  };
  