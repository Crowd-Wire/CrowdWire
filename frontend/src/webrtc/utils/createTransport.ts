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
  console.log(`create ${direction} transport`);
  const { device, addTransport } = useRoomStore.getState();
  var socket = getSocket(useWorldUserStore.getState().world_user.world_id).socket;

  // ask the server to create a server-side transport object and send
  // us back the info we need to create a client-side transport
  console.log("transport options", transportOptions);
  let transport =
    direction === "recv"
      ? await device!.createRecvTransport(transportOptions)
      : await device!.createSendTransport(transportOptions);
      
  const sctpParameters = transportOptions.sctpParameters
  // mediasoup-client will emit a connect event when media needs to
  // start flowing for the first time. send dtlsParameters to the
  // server, then call callback() on success or errback() on failure.
  transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
    console.log(sctpParameters)
    useWsHandlerStore
      .getState()
      .addWsListener(`@connect-transport-${direction}-done`, (d) => {
        if (d.error) {
          console.log(`connect-transport ${direction} failed`, d.error);
          if (d.error.includes("already called")) {
            callback();
          } else {
            errback();
          }
        } else {
          console.log(`connect-transport ${direction} success`);
          callback();
        }
      });
      
    if (socket.readyState === WebSocket.OPEN) {
      console.log('sending connect-transport')
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
        console.log("transport produce event", appData.mediaTag);
        
        // check this paused option
        let paused = false;

        useWsHandlerStore
          .getState()
          .addWsListener(`@send-track-${direction}-done`, (d) => {
            if (d.error) {
              console.log(`send-track ${direction} failed`, d.error);
              errback();
            } else {
              console.log(`send-track-transport ${direction} success`);
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
        console.log(parameters)
        useWsHandlerStore
          .getState()
          .addWsListener(`@send-file-${direction}-done`, (d) => {
            if (d.error) {
              console.log(`send-file ${direction} failed`, d.error);
              errback();
            } else {
              console.log(`send-file-transport ${direction} success`);
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

  transport.on("connectionstatechange", async (state) => {
    console.log(
      `${direction} transport ${transport.id} connectionstatechange ${state}`
    );
  });

  addTransport(direction, transport, _roomId);
}
