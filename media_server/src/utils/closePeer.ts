import { MyPeer } from "../MyPeer";

export const closePeer = (state: MyPeer) => {
  state.producer?.get('audio')?.close();
  state.producer?.get('video')?.close();
  state.producer?.get('media')?.close();
  state.producer?.get('file')?.close();
  state.recvTransport?.close();
  state.sendTransport?.close();
  state.consumers.forEach((c) => c.close());
};
