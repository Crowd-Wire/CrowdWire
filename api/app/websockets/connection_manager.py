from typing import Dict, Any

from fastapi import WebSocket
from loguru import logger

from app.core.consts import WebsocketProtocol as protocol
from app.redis.connection import redis_connector


class ConnectionManager:
    user_count = -1  # TODO: remove after tests
    group_count = -1

    def __init__(self):
        """
        Dictionary with the World_id as key and the List of Active Connections as
        value
        """
        self.users_ws: Dict[str, WebSocket] = {}

    # TODO: remove after tests
    def get_next_user_id(self):
        self.user_count += 1
        return str(self.user_count)

    def get_next_group_id(self):
        self.group_count += 1
        return str(self.group_count)

    async def connect(self, world_id: str, websocket: WebSocket, user_id: int):
        await websocket.accept()
        await websocket.receive_json()

        # store user's corresponding websockets
        self.users_ws[user_id] = websocket

        # send players snapshot
        players_snapshot = {}
        for uid in await redis_connector.get_world_users(world_id):
            players_snapshot[uid] = await redis_connector.get_user_position(world_id, uid)
        await self.send_personal_message(
            {'topic': protocol.PLAYERS_SNAPSHOT, 'snapshot': players_snapshot}, user_id)

        # save user on redis
        await redis_connector.add_users_to_world(world_id, user_id)

        logger.info(
            f"Connected User {user_id} to World {world_id}"
        )

    async def disconnect(self, world_id: str, user_id: str):
        if user_id in self.users_ws:
            del self.users_ws[user_id]
            await redis_connector.rem_users_from_world(world_id, user_id)
            logger.info(f"Disconnected User {user_id} from World {world_id}")

            # broadcast leave player
            await self.broadcast(
                world_id,
                {'topic': protocol.LEAVE_PLAYER, 'user_id': user_id},
                user_id
            )
        else:
            logger.error(
                f"Unrecognized User {user_id}"
            )

    async def send_personal_message(self, message: Any, user_id: str):
        if user_id in self.users_ws:
            await self.users_ws[user_id].send_json(message)
        else:
            logger.info(self.users_ws)
            logger.info(type(user_id))
            logger.error(f"Unrecognized User {user_id}")

    async def broadcast(self, world_id: str, payload: Any, sender_id: str = None):
        try:
            for uid in await redis_connector.get_world_users(world_id):
                if uid != sender_id:
                    await self.send_personal_message(payload, uid)
        except KeyError:
            logger.error(f"Error when trying to broadcast to World {world_id}")

    async def broadcast_to_user_rooms(self, world_id: str, payload: Any, sender_id: str = None):
        try:
            group_ids = await redis_connector.get_user_groups(world_id, sender_id)

            for room_id in group_ids:
                user_ids = await redis_connector.get_group_users(world_id, room_id)
                for user_id in user_ids:
                    if user_id != sender_id:
                        await self.send_personal_message(payload, user_id)
        except KeyError:
            logger.error(
                f"Error when trying to broadcast to World {world_id}, to User Rooms {sender_id}"
            )

    async def broadcast_to_conf_managers(self, world_id: str, payload: Any, conference: str):
        try:
            user_ids = await redis_connector.get_group_users(world_id, conference)
            for user_id in user_ids:
                if (await redis_connector.can_manage_conferences(world_id=world_id, user_id=user_id)):
                    await self.send_personal_message(payload, user_id)
        except KeyError:
            logger.error(
                f"Error when trying to broadcast conference managers of World {world_id}"
            )


manager = ConnectionManager()
