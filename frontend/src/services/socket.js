import { WS_BASE } from "config";
import { createTransport } from "../webrtc/utils/createTransport";
import { sendVoice } from "../webrtc/utils/sendVoice";
import { joinRoom } from "../webrtc/utils/joinRoom";
import store, { 
    connectPlayer, disconnectPlayer, movePlayer, 
    JOIN_PLAYER, LEAVE_PLAYER, PLAYER_MOVEMENT 
} from "redux/playerStore.js";

let commSocket;

export const getCommSocket = () => {
    if (!commSocket)
        commSocket = new WebSocket(`${WS_BASE}/?`);
    return commSocket;
}

let socket = null;

export const getSocket = (worldId) => {

    const sendPosition = (roomId, direction) => {
        console.log(direction)
        const payload = {
            topic: PLAYER_MOVEMENT,
            room_id: roomId,
            direction,
        }
        socket.send(JSON.stringify(payload));
        //dispatch();
    }

    const sendComms = (topic="", worldId="", userId="") => {
        const payload = {
            topic: topic,
            worldId: worldId,
            userId:userId,
        }
        socket.send(JSON.stringify(payload));
    }

    if (!socket) {
        socket = new WebSocket(`${WS_BASE}/ws/${worldId}`);

        socket.onopen = (event) => {
            console.info("[open] Connection established");
            socket.send(JSON.stringify({token: '', room_id: 1}));
            // const id = setInterval(() => {
            //     if (socket && socket.readyState !== socket.CLOSED) {
            //         socket.send("ping");
            //     } else {
            //         clearInterval(id);
            //     }
            // }, 8000);
        };
          
        socket.onmessage = (event) => {
            var data = JSON.parse(event.data);

            console.info(`[message] Data received for topic ${data.topic}`);

            switch (data.topic) {
                case JOIN_PLAYER:
                    store.dispatch(connectPlayer(data.user_id));
                    break;
                case LEAVE_PLAYER:
                    store.dispatch(disconnectPlayer(data.user_id));
                    break;
                case PLAYER_MOVEMENT:
                    store.dispatch(movePlayer(data.user_id, data.direction));
                    break;
                case "you-joined-as-peer":
                    console.log(data)
                    joinRoom(data.d.routerRtpCapabilities, data.d.roomId).then(() => {
                        createTransport(data.d.roomId, "recv", data.d.recvTransportOptions)
                    })
                    break;
                case "you-joined-as-speaker":
                    console.log(data)
                    joinRoom(data.d.routerRtpCapabilities, data.d.roomId).then(() => {
                        createTransport(data.d.roomId, "recv", data.d.recvTransportOptions)
                        createTransport(data.d.roomId, "send", data.d.sendTransportOptions).then(() => {
                            sendVoice();
                        });
                    })
                    break;
            }
        };
        
        socket.onclose = (event) => {
            if (event.wasClean) {
                console.info(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                // e.g. server process killed or network down
                // event.code is usually 1006 in this case
                console.info('[close] Connection died');
            }
        };
        
        socket.onerror = (error) => {
            console.error(`[error] ${error.message}`);
        };
    }

    return {socket, sendPosition, sendComms};
}