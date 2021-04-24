import { Consumer, Producer, Transport } from "mediasoup/lib/types";

export type MyPeer = {
  sendTransport: Transport | null;
  recvTransport: Transport | null;
  producer: Map<string, Producer> | null;
  consumers: Consumer[];
};
