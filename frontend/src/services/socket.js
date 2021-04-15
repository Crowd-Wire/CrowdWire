import { WS_BASE } from "config";

// import store, { 
//     connectPlayer, disconnectPlayer, movePlayer, 
//     JOIN_PLAYER, LEAVE_PLAYER, PLAYER_MOVEMENT 
// } from "redux/playerStore.js";

import playerStore from "stores/usePlayerStore.ts";

let commSocket;
let socket;

export const getCommSocket = () => {
    if (!commSocket)
        commSocket = new WebSocket(`${WS_BASE}/?`);
    return commSocket;
}


export const getSocket = (worldId) => {


    const joinRoom = async (roomId, position) => {
        const payload = {
            topic: "JOIN_PLAYER",
            room_id: roomId,
            position
        }
        if (socket.readyState === WebSocket.OPEN)
            await socket.send(JSON.stringify(payload));
        else
            console.error(`[error] socket closed before joinRoom`);
    }

    const sendMovement = async (roomId, position, velocity) => {
        const payload = {
            topic: "PLAYER_MOVEMENT",
            room_id: roomId,
            position,
            velocity,
        }
        if (socket.readyState === WebSocket.OPEN)
            await socket.send(JSON.stringify(payload));
        else
            console.error(`[error] socket closed before sendMovement`);
    }

    if (!socket) {
        socket = new WebSocket(`${WS_BASE}/ws/${worldId}`);

        socket.onopen = (event) => {
            console.info("[open] Connection established");
            socket.send(JSON.stringify({token: ''}));
        };
          
        socket.onmessage = (event) => {
            var data = JSON.parse(event.data);
            console.info(`[message] Data received for topic ${data.topic}`);

            switch (data.topic) {
                case "JOIN_PLAYER":
                    playerStore.getState().connectPlayer(data.user_id, data.position);
                    break;
                case "LEAVE_PLAYER":
                    playerStore.getState().disconnectPlayer(data.user_id);
                    break;
                case "PLAYER_MOVEMENT":
                    playerStore.getState().movePlayer(data.user_id, data.position, data.velocity);
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

    return {socket, sendMovement, joinRoom};
}






// export const socket =  io("ws://localhost:8000/ws/1", {  cors: {    origin: "*",    methods: ["GET", "POST"]  }});