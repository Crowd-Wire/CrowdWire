from typing import Dict, List, Any, Tuple

from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from loguru import logger
import json


class ConnectionManager:
    count = 0

    def __init__(self):
        """
        Dictionary with the World_id as key and the List of Active Connections as
        value
        """
        self.connections: Dict[int, Dict[int, List[WebSocket]]] = {}
        
        self.users_ws: Dict[int, WebSocket] = {}

    async def connect(self, world_id: int, websocket: WebSocket) -> Tuple[int, int]:
        await websocket.accept()
        
        payload = await websocket.receive_json()
        room_id = payload['room_id']
        token = payload['token']
        # futurely, get token from message and retrieve it's id??? guests will have a G prepended, ig
        user_id = self.count
        self.count += 1

        # store user's corresponding websocket
        self.users_ws[user_id] = websocket

        self.connections \
            .setdefault(world_id, {}) \
            .setdefault(room_id, []) \
            .append(user_id)
            
        logger.info(
            f"New connection added to World {world_id}, Room {room_id}"
        )

        return user_id, room_id

    def disconnect(self, world_id: int, room_id: int, user_id: int):
        try:
            self.connections[world_id][room_id].remove(user_id)
            if not self.connections[world_id][room_id]:
                self.connections[world_id].pop(room_id)
                if not self.connections[world_id]:
                    self.connections.pop(world_id)
            logger.info(f"Connection removed from World {world_id}, Room {room_id}")
        except KeyError:
            logger.error(
                f"Error when trying to remove connection from World {world_id}, "
                f"Room {room_id}"
            )

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, world_id: int, room_id: int, payload: dict, sender_id: int):
        try:
            for user_id in self.connections[world_id][room_id]:
                if user_id != sender_id:
                    await self.users_ws[user_id].send_json(payload)
            logger.info(
                f"Broadcasted to" f" World {world_id}, Room {room_id} the message: "
                f"{payload}"
            )
        except KeyError:
            logger.error(
                f"Error when trying to broadcast to World {world_id}, Room {room_id}"
            )


manager = ConnectionManager()
