import { MyPeer } from "../MyPeer";

export const closePeer = (state: MyPeer) => {
  state.producer?.audio?.close();
  state.producer?.video?.close();
  state.recvTransport?.close();
  state.sendTransport?.close();
  state.consumers.forEach((c) => c.close());
};
