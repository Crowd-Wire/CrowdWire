import io from "socket.io-client";
import { SOCKET_URL } from "config";

export const socket = new WebSocket("ws://localhost:8000/position/1");
// export const socket =  io("ws://localhost:8000/ws/1", {  cors: {    origin: "*",    methods: ["GET", "POST"]  }});