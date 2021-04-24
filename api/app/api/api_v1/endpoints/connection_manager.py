from typing import Dict, List

from fastapi import WebSocket
from loguru import logger
import json

from app.core.consts import WebsocketProtocol as protocol
from app.rabbitmq import rabbit_handler


class ConnectionManager:
    count = 0

    def __init__(self):
        """
        Dictionary with the World_id as key and the List of Active Connections as
        value
        """
        self.connections: Dict[str, Dict[str, List[WebSocket]]] = {}

        self.users_ws: Dict[str, WebSocket] = {}

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


async def join_player(world_id, user_id, payload):
    room_id = payload['room_id']
    position = payload['position']
    await manager.connect_room(world_id, room_id, user_id, position)


async def send_player_movement(world_id, user_id, payload):
    room_id = payload['room_id']
    velocity = payload['velocity']
    position = payload['position']
    await manager.broadcast(
        world_id, room_id,
        {'topic': protocol.PLAYER_MOVEMENT, 'user_id': user_id, 'velocity': velocity, 'position': position},
        user_id
    )


async def join_as_new_peer_or_speaker(world_id, user_id, payload):
    """
    join-as-new-peer:
        create a room if it doesnt exit and add that user to that room
        then media server returns receive transport options to amqp
        this should only allow to receive audio
    join-as-speaker:
        this does the same as above, except it allows
        the user to speak, so, it returns two kinds of transport,
        one for receiving and other for sending
    """
    room_id = payload['d']['roomId']
    payload['d']['peerId'] = user_id

    if room_id in manager.connections[world_id][room_id]:
        if user_id not in manager.connections[world_id][room_id]:
            manager.connections[world_id][room_id].append(user_id)
    else:
        manager.connections[world_id][room_id] = [user_id]

    await rabbit_handler.publish(json.dumps(payload))


async def handle_transport_or_track(user_id, payload):
    payload['d']['peerId'] = user_id
    await rabbit_handler.publish(json.dumps(payload))


async def close_media(world_id, user_id, payload):
    room_id = payload['d']['roomId']
    payload['d']['peerId'] = user_id

    # close in media server producer
    await rabbit_handler.publish(json.dumps(payload))

    # broadcast for peers to close this stream
    if user_id in manager.connections[world_id][room_id]:
        await manager.broadcast(world_id, room_id,
                                {'topic': protocol.CLOSE_MEDIA,
                                 'peerId': user_id},
                                user_id)


async def toggle_producer(world_id, user_id, payload):
    room_id = payload['d']['roomId']
    kind = payload['d']['kind']
    pause = payload['d']['pause']
    payload['d']['peerId'] = user_id
    # pause in media server producer
    await rabbit_handler.publish(json.dumps(payload))
    # broadcast for peers to update UI toggle buttons
    if user_id in manager.connections[world_id][room_id]:
        await manager.broadcast(world_id, room_id,
                                {'topic': protocol.TOGGLE_PEER_PRODUCER,
                                 'peerId': user_id,
                                 'kind': kind,
                                 'pause': pause},
                                user_id)


async def speaking_change(world_id, user_id, payload):
    room_id = payload['d']['roomId']
    value = payload['d']['value']
    logger.info(user_id)
    logger.info(manager.connections[world_id][room_id])
    if user_id in manager.connections[world_id][room_id]:
        await manager.broadcast(world_id, room_id,
                                {'topic': protocol.ACTIVE_SPEAKER, 'peerId': user_id, 'value': value}, user_id)


manager = ConnectionManager()
