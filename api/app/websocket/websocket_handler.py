import json
import re
from typing import List

from app.core.consts import WebsocketProtocol as protocol
from app.rabbitmq import rabbit_handler
from app.redis.connection import redis_connector
from app.websocket.connection_manager import manager
from fastapi import WebSocket
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


async def normalize_wire(world_id: str, user_id: str, found_users_id: List[str]):
    user_groups = []
    all_groups = set()
    joinable_groups = set()

    return await redis_connector.add_users_to_group(world_id, manager.get_next_group_id(), 
                user_id, *found_users_id)


    for fuid in found_users_id:
        groups = await redis_connector.get_user_groups(world_id, fuid)
        user_groups.append((fuid, set(groups)))
        all_groups.update(groups)
        # TODO: check joinable here?

    # user_groups.sort(key=lambda x: len(x[1]))

    test_groups = set(await redis_connector.get_user_groups(world_id, user_id))

    near_users_id = set(found_users_id)
    for gid in await redis_connector.get_user_groups(world_id, user_id):
        for uid in await redis_connector.get_group_users(world_id, gid):
            near_users_id.add(uid)
    print('near_users_id:', near_users_id)

    # get joinable groups
    for group_id in all_groups:
        users = await redis_connector.get_group_users(world_id, group_id)
        if set(users).issubset(near_users_id):
            # joinable
            joinable_groups.add(group_id)
        
        if test_groups & set(group_id):
            logger.error('something fishy happening, did you flushdb?')
    # TODO: fix joinable bad

    found_groups_id = [(fuid, groups & joinable_groups) for fuid, groups in user_groups]

    count = 0
    print('user_groups:', found_groups_id)
    print('all_groups:', all_groups)
    print('joinable_groups:', joinable_groups)

    state = 0
    while found_groups_id:
        count += 1
        # if count % 1000 == 0:
        #     print('\n', found_groups_id)
        #     await send_groups_snapshot(world_id)
        if count > 10:
            break
        print('\n', count ,' state:', state + 1, 'user_groups:', found_groups_id)
        await send_groups_snapshot(world_id)
        await users_snapshot(world_id)

        state += 1
        
        if state == 1:
            for _, groups in list(found_groups_id):
                if len(groups) == 1:
                    state = 0

                    print('\n', count ,' state:', state, 'user_groups:', found_groups_id)
                    await send_groups_snapshot(world_id)
                    await users_snapshot(world_id)

                    # assign to group immediately
                    await redis_connector.add_groups_to_user(world_id, user_id, *groups)
                    found_groups_id = list(filter(lambda x: not x[1] & groups, found_groups_id))
                    break
            
        if state == 2:
            # no assignement was made last iteration
            for _, groups in list(found_groups_id):
                if len(groups) > 1:
                    state = 0
                    group = next(iter(groups))

                    print('\n', count ,' state:', state, 'user_groups:', found_groups_id)
                    await send_groups_snapshot(world_id)
                    await users_snapshot(world_id)

                    # assign to group
                    await redis_connector.add_groups_to_user(world_id, user_id, group)
                    found_groups_id = list(filter(lambda x: not group in x[1], found_groups_id))
                    break
        
        if state == 3:
            # no assignement was made last 2 iterations
            # there are users with no joinable group, create new group
            # create group

            print('\n', count ,' state:', state, 'user_groups:', found_groups_id)
            await send_groups_snapshot(world_id)
            await users_snapshot(world_id)

            await redis_connector.add_users_to_group(world_id, manager.get_next_group_id(), 
                user_id, *[fuid for fuid, groups in found_groups_id])
            # normalized finished
            break
            

async def normalize_unwire(world_id: str, user_id: str, lost_users_id: List[str]):
    ...


async def send_groups_snapshot(world_id: str, user_id: str=None):
    groups = {}
    groups_keys = await redis_connector.scan_match_all(f"world:{world_id}:user:*:groups")
    
    for key in groups_keys:
        uid = re.match(r".+:user:(.+):groups", key.decode("utf-8"))[1] # eww urrgh
        grps = await redis_connector.smembers(key)
        groups[uid] = grps

    if user_id in (None, 'final'):
        print('\nfinal redis_groups:' if user_id != None else 'redis_groups:', groups )
    else:
        await manager.broadcast(world_id, '1', {'topic': 'GROUPS_SNAPSHOT', 'groups': groups}, None)


async def users_snapshot(world_id: str, user_id: str=None):
    users = {}
    users_keys = await redis_connector.scan_match_all(f"world:{world_id}:group:*")

    for key in users_keys:
        gid = re.match(r".+:group:(.+)", key.decode("utf-8"))[1] # eww urrgh
        usrs = await redis_connector.smembers(key)
        users[gid] = usrs

    print('final redis_users:' if user_id != None else 'redis_users:', users )


async def wire_players(world_id: str, user_id: str, payload: dict):
    users_id = payload['users_id']

    # add nearby users to user:X:users
    await redis_connector.add_users_to_user(world_id, user_id, *users_id)
    
    for uid in users_id:
        if uid not in manager.users_ws:
            # check if local user TODO: remove after testing
            logger.debug(f"User {user_id} does job for static User {uid}")      

            # add self to local user
            await redis_connector.add_users_to_user(world_id, uid, user_id)
            # create new group or assign to right groups
            await normalize_wire(world_id, user_id, users_id)

        elif await redis_connector.sismember(f"world:{world_id}:user:{uid}:users", user_id):
            # check if user already claimed proximity
            logger.debug(f"User {user_id} confirmed User {uid} claimance")

            # create new group or assign to right groups
            await normalize_wire(world_id, user_id, users_id)

    # TODO: remove after testing
    await send_groups_snapshot(world_id, user_id)
    await send_groups_snapshot(world_id, 'final')
    await users_snapshot(world_id, 'final')


async def unwire_players(world_id: str, user_id: str, payload: dict):
    users_id = payload['users_id']

    # remove faraway users from user:X:users
    await redis_connector.srem(f"world:{world_id}:user:{user_id}:users", *users_id)

    for uid in users_id:
        if uid not in manager.users_ws:
            # check if local user TODO: remove after testing

            # remove self from local user
            await redis_connector.srem(f"world:{world_id}:user:{uid}:users", user_id)

            # remove group or simply remove from groups
            await normalize_wire(world_id, user_id, users_id)

        elif not await redis_connector.sismember(f"world:{world_id}:user:{uid}:users", user_id):
            # check if user already claimed farness

            # remove group or simply remove from groups
            await normalize_unwire(world_id, user_id, users_id)

    # TODO: remove after testing
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
