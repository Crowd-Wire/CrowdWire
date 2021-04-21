import { Consumer, Producer, Transport, MediaKind } from "mediasoup/lib/types";

export type MyPeer = {
  sendTransport: Transport | null;
  recvTransport: Transport | null;
  producer: Map<MediaKind, Producer> | null;
  consumers: Consumer[];
};
