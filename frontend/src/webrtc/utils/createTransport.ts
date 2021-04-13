import { TransportOptions } from "mediasoup-client/lib/types";
import { getSocket } from "../../services/socket";
import { useVoiceStore } from "../stores/useVoiceStore";
import { useWsHandlerStore } from "../stores/useWsHandlerStore";


export async function createTransport(
  _roomId: string,
  direction: "recv" | "send",
  transportOptions: TransportOptions
) {
  console.log(`create ${direction} transport`);
  const { device, set } = useVoiceStore.getState();
  var socket = getSocket(1).socket;

  // ask the server to create a server-side transport object and send
  // us back the info we need to create a client-side transport
  console.log("transport options", transportOptions);
  let transport =
    direction === "recv"
      ? await device!.createRecvTransport(transportOptions)
      : await device!.createSendTransport(transportOptions);

  // mediasoup-client will emit a connect event when media needs to
  // start flowing for the first time. send dtlsParameters to the
  // server, then call callback() on success or errback() on failure.
  transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
    socket.onmessage = (event) => {
      var data = JSON.parse(event.data);
      
      console.info(`[message] Data received for topic ${data.topic}`);

      if (data.topic == `@connect-transport-${direction}-done`) {
        if (data.d.error) {
          console.log(`connect-transport ${direction} failed`, data.d.error);
          if (data.d.error.includes("already called")) {
            callback();
          } else {
            errback();
          }
        } else {
          console.log(`connect-transport ${direction} success`);
          callback();
        }
      }
    }
      
    if (socket.readyState === WebSocket.OPEN) {
      console.log('sending connect-transport')
      socket.send(JSON.stringify({
        topic: "@connect-transport",
        d: { roomId: _roomId, transportId: transportOptions.id, dtlsParameters, direction },
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
        let paused = false


        socket.onmessage = (event) => {
          var data = JSON.parse(event.data);
          
          console.info(`[message] Data received for topic ${data.topic}`);
    
          if (data.topic == `@send-track-${direction}-done`) {
            if (data.d.error) {
              console.log(`send-track ${direction} failed`, data.d.error);
              errback();
            } else {
              console.log(`send-track-transport ${direction} success`);
              callback({ id: data.d.id });
            }
          }
        }
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            topic: "@send-track",
            d: {
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
  }

  // for this simple demo, any time a transport transitions to closed,
  // failed, or disconnected, leave the room and reset
  //
  transport.on("connectionstatechange", async (state) => {
    console.log(
      `${direction} transport ${transport.id} connectionstatechange ${state}`
    );
  });

  if (direction === "recv") {
    set({ recvTransport: transport });
  } else {
    set({ sendTransport: transport });
  }
}
