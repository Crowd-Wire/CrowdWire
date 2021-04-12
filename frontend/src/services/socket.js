import { WS_BASE } from "config";

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


export const getSocket = (worldId) => {
    let socket;

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

    if (!socket) {
        socket = new WebSocket(`${WS_BASE}/position/${worldId}`);

        socket.onopen = (event) => {
            console.info("[open] Connection established");
            socket.send(JSON.stringify({token: '', room_id: 1}));
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

    return {socket, sendPosition};
}






// export const socket =  io("ws://localhost:8000/ws/1", {  cors: {    origin: "*",    methods: ["GET", "POST"]  }});