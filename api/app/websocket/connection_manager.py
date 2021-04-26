from typing import Dict, List, Any

from fastapi import WebSocket
from loguru import logger

from app.core.consts import WebsocketProtocol as protocol
from app.redis.connection import redis_connector

class ConnectionManager:
    count = 0
    group_count = -1 # TODO: remove

    def __init__(self):
        """
        Dictionary with the World_id as key and the List of Active Connections as
        value
        """
        self.connections: Dict[str, Dict[str, List[WebSocket]]] = {}

        self.users_ws: Dict[str, WebSocket] = {}

    def get_next_group_id(self): # TODO: remove
        self.group_count += 1
        return self.group_count

    async def connect(self, world_id: str, websocket: WebSocket) -> str:
        await websocket.accept()

        await websocket.receive_json()
        # token = payload['token']
        # futurely, get token and retrieve it's id??? guests will have a G prepended, ig
        user_id = str(self.count)
        self.count += 1

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
            # send players snapshot
            players_snapshot = {}
            for uid in self.connections[world_id][room_id]:
                if uid != user_id:
                    players_snapshot[uid] = await redis_connector.get_user_position(world_id, room_id, uid)
            await self.users_ws[user_id].send_json(
                {'topic': protocol.PLAYERS_SNAPSHOT, 'snapshot': players_snapshot})

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

    async def disconnect_room(self, world_id: int, room_id: int, user_id: int):
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

    async def send_personal_message(self, message: Any, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, world_id: str, room_id: str, payload: Any, sender_id: str):
        try:
            for user_id in self.connections[world_id][room_id]:
                if user_id != sender_id:
                    await self.users_ws[user_id].send_json(payload)
            # logger.info(
            #     f"Broadcasted to" f" World {world_id}, Room {room_id} the message: "
            #     f"{payload}"
            # )
        except KeyError:
            logger.error(
                f"Error when trying to broadcast to World {world_id}, Room {room_id}"
            )


manager = ConnectionManager()
