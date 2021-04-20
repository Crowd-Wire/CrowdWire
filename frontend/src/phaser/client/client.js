
import io from "socket.io-client";
import protocol from "../global/protocol.js";

const getClientSocket = (client, worldId) => {

    client.socket = io("localhost:4000", {
        path: "/game",
        query: `worldId=${worldId}`,
        transports : ['websocket']
    });

    client.socket.on(protocol.PONG, (packet) => {
        client.setTimeDelta(packet);
        console.log('c2sDelta', client.c2sDelta, 's2cDelta', client.s2cDelta)
    });
      
};

export default getClientSocket;