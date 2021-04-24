from app.core.consts import WebsocketProtocol as protocol
from app.websocket.connection_manager import manager
from app.rabbitmq import rabbit_handler
from app.redis.connection import redis_connector
from loguru import logger

import json


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


async def wire_player(world_id, user_id, payload):
    room_id = payload['room_id']
    player_id = payload['player_id']

    await redis_connector.sadd(f"lixo:{world_id}:{user_id}", 'bruno', 'pedro', 'daniel', 'mario')
    n = await redis_connector.scard(f"lixo:{world_id}:{user_id}")
    print(n)
    b = await redis_connector.sismember(f"lixo:{world_id}:{user_id}", 'leandro')
    print(b)
    m = await redis_connector.smembers(f"lixo:{world_id}:{user_id}", encoding=None)
    print(m)


async def unwire_player(world_id, user_id, payload):
    room_id = payload['room_id']
    player_id = payload['player_id']
    ...


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
