import { getSocket } from "../../services/socket";
import { useVoiceStore } from "../stores/useVoiceStore";
import { useWsHandlerStore } from "../stores/useWsHandlerStore";
import { consumeAudio } from "./consumeAudio";

export const receiveVoice = (flushQueue: () => void) => {
  useWsHandlerStore
    .getState()
    .addWsListenerOnce(
      "@get-recv-tracks-done",
      async ({ consumerParametersArr }) => {
        try {
          for (const { peerId, consumerParameters } of consumerParametersArr) {
            if (!(await consumeAudio(consumerParameters, peerId))) {
              break;
            }
          }
        } catch (err) {
          console.log(err);
        } finally {
          flushQueue();
        }
      }
    );
  var socket = getSocket();
  socket.send({
    op: "@get-recv-tracks",
    d: {
      rtpCapabilities: useVoiceStore.getState().device!.rtpCapabilities,
    },
  });
};
