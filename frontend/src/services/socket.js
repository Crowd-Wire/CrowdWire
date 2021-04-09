import { WS_BASE } from "config";

let socket;
let commSocket;

export const getSocket = () => {
    if (!socket)
        socket = new WebSocket(`${WS_BASE}/position/1`)
    return socket
}

export const getCommSocket = () => {
    if (!commSocket)
        commSocket = new WebSocket(`${WS_BASE}/?`)
    return commSocket
}

// export const socket =  io("ws://localhost:8000/ws/1", {  cors: {    origin: "*",    methods: ["GET", "POST"]  }});