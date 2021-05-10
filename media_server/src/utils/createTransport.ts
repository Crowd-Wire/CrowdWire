import debugModule from "debug";
import { Router, WebRtcTransport } from "mediasoup/lib/types";
import { MediaSendDirection } from "src/types";
import { config } from "../config";

const log = debugModule("crowdwire:create-transport");


export const transportToOptions = ({
  id,
  iceParameters,
  iceCandidates,
  dtlsParameters,
}: WebRtcTransport) => ({ id, iceParameters, iceCandidates, dtlsParameters });

export type TransportOptions = ReturnType<typeof transportToOptions>;

export const createTransport = async (
  direction: MediaSendDirection,
  router: Router,
  peerId: string
) => {
  log("create-transport", direction);
  const {
    listenIps,
    initialAvailableOutgoingBitrate,
  } = config.mediasoup.webRtcTransport;

  const transport = await router.createWebRtcTransport({
    listenIps: listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
    appData: { peerId, clientDirection: direction },
  });
  return transport;
};
