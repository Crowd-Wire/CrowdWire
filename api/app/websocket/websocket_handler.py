import json
import re

from app.core.consts import WebsocketProtocol as protocol
from app.rabbitmq import rabbit_handler
from app.redis.connection import redis_connector
from app.websocket.connection_manager import manager
from loguru import logger


async def join_player(world_id: str, user_id: str, payload: dict):
    room_id = payload['room_id']
    position = payload['position']
    await manager.connect_room(world_id, room_id, user_id, position)
    # store position on redis
    await redis_connector.set_user_position(world_id, room_id, user_id, position)


async def send_player_movement(world_id: str, user_id: str, payload: dict):
    room_id = payload['room_id']
    velocity = payload['velocity']
    position = payload['position']
    # store position on redis
    await redis_connector.set_user_position(world_id, room_id, user_id, position)

    await manager.broadcast(
        world_id, room_id,
        {'topic': protocol.PLAYER_MOVEMENT, 'user_id': user_id, 'velocity': velocity, 'position': position},
        user_id
    )


async def send_groups_snapshot(world_id: str, user_id: str):
    groups = {}
    groups_keys = await redis_connector.scan_match_all(f"world:{world_id}:user:*:groups")

    # TODO: change dis pls
    for key in groups_keys:
        uid = re.match(r".+:user:(.+):groups", key.decode("utf-8"))[1]  # eww urrgh
        grps = await redis_connector.smembers(key)
        groups[uid] = grps

    logger.debug('Broadcasting GROUPS SNAPSHOT')
    await manager.broadcast(world_id, '1', {'topic': 'GROUPS_SNAPSHOT', 'groups': groups}, None)


async def wire_players(world_id: str, user_id: str, payload: dict):
    users_id = payload['users_id']

    # add nearby users to user:X:users
    await redis_connector.add_users_to_user(world_id, user_id, *users_id)

    add_users = set()
    for uid in users_id:
        # if await redis_connector.sismember(f"world:{world_id}:user:{uid}:users", user_id):
        # check if user already claimed proximity
        logger.debug(f"User {user_id} confirmed User {uid} claimance")
        add_users.add(uid)

    # create new group and let it normalize
    if add_users:
        await redis_connector.add_users_to_group(world_id, manager.get_next_group_id(),
                                                 user_id, *add_users)

    await send_groups_snapshot(world_id, user_id)


async def unwire_players(world_id: str, user_id: str, payload: dict):
    users_id = payload['users_id']

    # remove faraway users from user:X:users
    await redis_connector.rem_users_from_user(world_id, user_id, *users_id)

    # better no checking if user already claimed proximity

    # remove group or simply remove from groups
    rem_groups = set()
    for uid in users_id:
        rem_groups.update(await redis_connector.get_user_groups(world_id, user_id))
    if rem_groups:
        await redis_connector.rem_groups_from_user(world_id, user_id, *rem_groups)

    await send_groups_snapshot(world_id, user_id)


async def join_as_new_peer_or_speaker(world_id: str, user_id: str, payload: dict):
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


async def handle_transport_or_track(user_id: str, payload: dict):
    payload['d']['peerId'] = user_id
    await rabbit_handler.publish(json.dumps(payload))


async def close_media(world_id: str, user_id: str, payload: dict):
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


async def toggle_producer(world_id: str, user_id: str, payload: dict):
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


async def speaking_change(world_id: str, user_id: str, payload: dict):
    room_id = payload['d']['roomId']
    value = payload['d']['value']
    logger.info(user_id)
    logger.info(manager.connections[world_id][room_id])
    if user_id in manager.connections[world_id][room_id]:
        await manager.broadcast(world_id, room_id,
                                {'topic': protocol.ACTIVE_SPEAKER, 'peerId': user_id, 'value': value}, user_id)
