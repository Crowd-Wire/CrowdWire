import { TransportOptions } from "mediasoup-client/lib/types";
import { getSocket } from "../../services/socket";
import { useRoomStore } from "../stores/useRoomStore";
import { useWsHandlerStore } from "../stores/useWsHandlerStore";
import useWorldUserStore from "../../stores/useWorldUserStore";

export async function createTransport(
  _roomId: string,
  direction: "recv" | "send",
  transportOptions: TransportOptions
) {
  const { device, addTransport } = useRoomStore.getState();
  var socket = getSocket(useWorldUserStore.getState().world_user.world_id).socket;

  // ask the server to create a server-side transport object and send
  // us back the info we need to create a client-side transport
  let transport =
    direction === "recv"
      ? await device!.createRecvTransport(transportOptions)
      : await device!.createSendTransport(transportOptions);
      
  const sctpParameters = transportOptions.sctpParameters
  // mediasoup-client will emit a connect event when media needs to
  // start flowing for the first time. send dtlsParameters to the
  // server, then call callback() on success or errback() on failure.
  transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
    useWsHandlerStore
      .getState()
      .addWsListener(`@connect-transport-${direction}-done`, (d) => {
        if (d.error) {
          if (d.error.includes("already called")) {
            callback();
          } else {
            errback();
          }
        } else {
          callback();
        }
      });
      
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        topic: "@connect-transport",
        d: { roomId: _roomId, transportId: transportOptions.id, dtlsParameters, sctpParameters, direction },
      }));
    }
  });

  if (direction === "send") {
    // sending transports will emit a produce event when a new track
    // needs to be set up to start sending. the producer's appData is
    // passed as a parameter
    transport.on(
      "produce",
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        
        // check this paused option
        let paused = false;

        useWsHandlerStore
          .getState()
          .addWsListener(`@send-track-${direction}-done`, (d) => {
            if (d.error) {
              errback();
            } else {
              callback({ id: d.id });
            }
          });

        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            topic: "@send-track",
            d: {
              roomId: _roomId,
              transportId: transportOptions.id,
              kind,
              rtpParameters,
              rtpCapabilities: device!.rtpCapabilities,
              paused,
              appData,
              direction,
            },
          }));
        }
      }
    );


    transport.on(
      "producedata",
      async (parameters, callback, errback) => {
        useWsHandlerStore
          .getState()
          .addWsListener(`@send-file-${direction}-done`, (d) => {
            if (d.error) {
              errback();
            } else {
              callback({ id: d.id });
            }
          });
        
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            topic: "@send-file",
            d: {
              roomId: _roomId,
              transportId: transportOptions.id,
              sctpStreamParameters: parameters.sctpStreamParameters,
              protocol: parameters.protocol,
              appData: parameters.appData,
              direction
            },
          }));
        }
      }
    );
  }
  addTransport(direction, transport, _roomId);
}
