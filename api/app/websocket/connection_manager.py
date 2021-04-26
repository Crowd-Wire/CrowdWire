from typing import Dict, List

from fastapi import WebSocket
from loguru import logger

from app.core.consts import WebsocketProtocol as protocol


class ConnectionManager:

    def __init__(self):
        """
        Dictionary with the World_id as key and the List of Active Connections as
        value
        """
        self.connections: Dict[str, Dict[str, List[WebSocket]]] = {}

        self.users_ws: Dict[str, WebSocket] = {}

    async def connect(self, world_id: str, websocket: WebSocket, user_id: int) -> str:

        await websocket.accept()

        await websocket.receive_json()

        # store user's corresponding websocket
        self.users_ws[user_id] = websocket

        logger.info(
            f"New connection added to World {world_id}"
        )
        return user_id

    def disconnect(self, world_id: str, user_id: str):
        del self.users_ws[user_id]
        logger.info(
            f"Disconnected User {user_id} from World {world_id}"
        )

    async def connect_room(self, world_id: str, room_id: str, user_id: str, joiner_position: dict):

        if world_id in self.connections and room_id in self.connections[world_id]:
            for other_id in self.connections[world_id][room_id]:
                # get position from redis
                position = {'x': 50, 'y': 50}
                await self.users_ws[user_id].send_json(
                    {'topic': protocol.JOIN_PLAYER, 'user_id': other_id, 'position': position})

        self.connections \
            .setdefault(world_id, {}) \
            .setdefault(room_id, []) \
            .append(user_id)
        logger.info(
            f"New connection to World {world_id}, Room {room_id}"
        )
        await self.broadcast(
            world_id, room_id,
            {'topic': protocol.JOIN_PLAYER, 'user_id': user_id, 'position': joiner_position},
            user_id
        )

    async def disconnect_room(self, world_id: str, room_id: str, user_id: str):
        try:
            self.connections[world_id][room_id].remove(user_id)
            if not self.connections[world_id][room_id]:
                self.connections[world_id].pop(room_id)
                if not self.connections[world_id]:
                    self.connections.pop(world_id)
            logger.info(f"Removed connection from World {world_id}, Room {room_id}")
        except KeyError:
            logger.error(
                f"Error when trying to remove connection from World {world_id}, "
                f"Room {room_id}"
            )
        await self.broadcast(
            world_id, room_id,
            {'topic': protocol.LEAVE_PLAYER, 'user_id': user_id},
            user_id
        )

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, world_id: str, room_id: str, payload: dict, sender_id: str):
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
