import { Transport, Producer, DataProducer, Consumer, DataConsumer } from "mediasoup/lib/types";

export type MyPeer = {
  sendTransport: Transport | null;
  recvTransport: Transport | null;
  producer: Map<string, Producer|DataProducer> | null;
  consumers: (Consumer|DataConsumer)[];
};
