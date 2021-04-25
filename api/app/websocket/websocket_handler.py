from typing import List

from app.core.consts import WebsocketProtocol as protocol
from app.websocket.connection_manager import manager
from app.rabbitmq import rabbit_handler
from app.redis.connection import redis_connector
from loguru import logger

import json
import re


async def join_player(world_id: str, user_id: str, payload: dict):
    room_id = payload['room_id']
    position = payload['position']
    await manager.connect_room(world_id, room_id, user_id, position)


async def send_player_movement(world_id: str, user_id: str, payload: dict):
    room_id = payload['room_id']
    velocity = payload['velocity']
    position = payload['position']
    await manager.broadcast(
        world_id, room_id,
        {'topic': protocol.PLAYER_MOVEMENT, 'user_id': user_id, 'velocity': velocity, 'position': position},
        user_id
    )


async def add_to_group(world_id: str, group_id: str, user_id: str, *users_id: List[str]):
    users_id = [user_id, *users_id]
    await redis_connector.sadd(f"world:{world_id}:groups:{group_id}", *users_id)
    for uid in users_id:
        await redis_connector.sadd(f"world:{world_id}:user:{uid}:groups", group_id)


async def add_to_user(world_id: str, user_id: str, group_id: str, *groups_id: List[str]):
    groups_id = [group_id, *groups_id]
    await redis_connector.sadd(f"world:{world_id}:user:{user_id}:groups", *groups_id)
    for gid in groups_id:
        await redis_connector.sadd(f"world:{world_id}:groups:{gid}", user_id)


async def normalize_wire(world_id: str, user_id: str, found_users_id: List[str]):
    user_groups = []
    all_groups = set()
    joinable_groups = set()

    for id_ in found_users_id:
        groups = await redis_connector.smembers(f"world:{world_id}:user:{id_}:groups")
        user_groups.append((id_, set(groups)))
        all_groups.update(groups)
        # TODO: check joinable here?

    user_groups.sort(key=lambda x: len(x[1]))

    # get joinable groups
    for group_id in all_groups:
        users = await redis_connector.smembers(f"world:{world_id}:group:{group_id}")
        if set(users).issubset(set(found_users_id)):
            # joinable
            joinable_groups.add(group_id)

    state = 0
    while len(user_groups) > 0:
        
        if state in (0, 1):
            state += 1
            for user, groups in list(user_groups):
                if len(groups & joinable_groups) == 1:
                    state = 0

                    # assign to group immediately
                    await add_to_user(world_id, user_id, *groups)
                    filter(lambda u, g: not g & groups, user_groups)
            
        if state in (1, 2):
            state += 1
            # no assignement was made last iteration
            for user, groups in list(user_groups):
                if len(groups & joinable_groups) > 1:
                    state = 1
                    group = next(iter(groups))

                    # assign to group
                    await add_to_user(world_id, user_id, group)
                    filter(lambda u, g: not group in g, user_groups)
                    break
        
        if state in (2, 3):
            state += 1
            # no assignement was made last 2 iterations
            # create group
            await add_to_group(world_id, manager.get_next_group_id(), 
                user_id, *[user for user, groups in user_groups])
            # normalized finished
            break
            

async def normalize_unwire(world_id: str, user_id: str, lost_users_id: List[str]):
    ...


async def send_groups_snapshot(world_id: str, user_id: List[str], websocket):
    groups = {}
    groups_keys = await redis_connector.scan_match_all(f"world:{world_id}:user:*:groups")
    
    for key in groups_keys:
        uid = re.match(r"*:user:(.+)+:groups", key)[0] # eww urrgh
        grps = await redis_connector.smembers(key)
        print('\n\n',uid, grps, '\n')
        groups[uid] = grps

    await manager.send_personal_message({'topic': 'GROUPS_SNAPSHOT', 'groups': groups}, websocket)


async def wire_players(world_id: str, user_id: str, payload: dict, websocket):
    users_id = payload['users_id']

    # add nearby users to user:X:users
    await redis_connector.sadd(f"world:{world_id}:user:{user_id}:users", *users_id)

    
    for uid in users_id:
        if uid not in manager.users_ws:
            # check if local user TODO: remove after testing

            # add self to local user
            await redis_connector.sadd(f"world:{world_id}:user:{uid}:users", user_id)
            # create new group or assign to right groups
            await normalize_wire(world_id, user_id, users_id)

        elif await redis_connector.sismember(f"world:{world_id}:user:{uid}:users", user_id):
            # check if user already claimed proximity

            # create new group or assign to right groups
            await normalize_wire(world_id, user_id, users_id)

    # TODO: remove after testing
    await send_groups_snapshot(world_id, user_id, websocket)


async def unwire_players(world_id: str, user_id: str, payload: dict, websocket):
    users_id = payload['users_id']

    # remove faraway users from user:X:users
    await redis_connector.srem(f"world:{world_id}:user:{user_id}:users", *users_id)

    
    for uid in users_id:
        if uid not in manager.users_ws:
            # check if local user TODO: remove after testing

            # remove self from local user
            await redis_connector.srem(f"world:{world_id}:user:{uid}:users", user_id)
            ...

        elif not await redis_connector.sismember(f"world:{world_id}:user:{uid}:users", user_id):
            # check if user already claimed farness

            # remove group or simply remove from groups
            ...

    # TODO: remove after testing
    await send_groups_snapshot(world_id, user_id, websocket)


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
