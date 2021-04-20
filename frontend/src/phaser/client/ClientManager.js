import protocol from "../global/protocol.js";
import config from "../global/config.js";

import getClientSocket from "./client.js";

class ClientManager {
    c2sDelta;
    s2cDelta;

    constructor(worldId) {
        getClientSocket(this, worldId);
        this.ping();
    }

    ping = () => {
        setTimeout(() => {
            this.socket.emit(protocol.PING, Date.now());
            this.ping();
        }, config.PING_INTERVAL);
    }

    setTimeDelta = ({clientTime, serverTime}) => {
        this.c2sDelta = serverTime - clientTime;
        this.s2cDelta = Date.now() - serverTime;
    };

    joinUser = () => {
        this.socket.emit(protocol.JOIN_USER);
    }
}


export default ClientManager;