from app.core.consts import WebsocketProtocol as protocol
from app.rabbitmq import rabbit_handler
from app.redis.connection import redis_connector
from app.websockets.connection_manager import manager
from datetime import datetime
from loguru import logger
import asyncio
import time

async def join_player(world_id: str, user_id: str, payload: dict):
    position = payload['position']
    # store position on redis
    await redis_connector.set_user_position(world_id, user_id, position)
    user = await redis_connector.get_world_user_data_dict(world_id=world_id, user_id=user_id)
    if user:
        user['user_id'] = user_id
        # broadcast join player
        await manager.broadcast(
            world_id,
            {'topic': protocol.JOIN_PLAYER, 'user': user, 'position': position},
            user_id
        )
        await send_groups_snapshot(world_id)  # TODO: remove after tests


async def send_player_movement(world_id: str, user_id: str, payload: dict):
    velocity = payload['velocity']
    position = payload['position']

    await manager.broadcast(
        world_id,
        {'topic': protocol.PLAYER_MOVEMENT, 'user_id': user_id, 'velocity': velocity, 'position': position},
        user_id
    )


async def set_user_position(world_id: str, user_id: str, payload: dict):
    # store position on redis
    await redis_connector.set_user_position(world_id, user_id, payload['position'])


async def send_message(world_id: str, user_id: str, payload: dict):
    payload['date'] = datetime.now().strftime('%H:%M')
    payload['from'] = user_id
    send_to = payload['to']
    if send_to == protocol.MESSAGE_TO_ALL:
        await manager.broadcast(world_id, payload)
    elif send_to == protocol.MESSAGE_TO_NEARBY:
        await manager.broadcast_to_user_rooms(world_id, payload, user_id)
        await manager.send_personal_message(payload, user_id)


# TODO: remove after tests
async def send_groups_snapshot(world_id: str):
    """Send a group snapshot to all users from a world

    Allows devs to see in frontend the groups assigned to the users
    """
    groups = {}
    for uid in manager.users_ws:
        groups[uid] = await redis_connector.smembers(f"world:{world_id}:user:{uid}:groups")

    await manager.broadcast(world_id, {'topic': 'GROUPS_SNAPSHOT', 'groups': groups})


async def wire_players(world_id: str, user_id: str, payload: dict):
    users_id = payload['users_id']

    # add nearby users
    await redis_connector.add_users_to_user(world_id, user_id, *users_id)

    add_users = set()
    for uid in users_id:
        sorted_users = sorted([user_id, uid])
        common_key = f"world:{world_id}:lock:{sorted_users[0]}:{sorted_users[1]}"

        if uid < user_id:
            threshold = 2
            while True:
                if await redis_connector.rpop(f"{common_key}"):
                    # create group
                    logger.info(f'[WIRE] user {user_id} criou o grupo')
                    add_users.add(uid)
                    break
                if (threshold := threshold - .1):
                    logger.info(f'[WIRE] IGNORE')
                    # ignore
                    break
                await asyncio.sleep(.1)
        else:
            logger.info(f'[WIRE] user {user_id}')
            await redis_connector.lpush(f"{common_key}", time.time())

        # if not (test:=await redis_connector.master.execute('sadd', common_key, 1)):
        #     # hack to check if user already claimed proximity
        #     logger.info(f'[WIRE] user {user_id} criou o grupo')
        #     add_users.add(uid)
        #     logger.debug(test)
        #     await redis_connector.delete(common_key)
        #     logger.debug(f" {user_id} deleted {common_key}")
        # else:
        #     logger.debug(test)

    actions = {}
    # create new group and let it normalize
    if add_users:
        next_group_id = await redis_connector.get_next_group()
        actions = await redis_connector.add_users_to_group(
            world_id, next_group_id,
            user_id, *add_users)

    # actions made to groups
    await handle_actions(actions)

    add_users.add(user_id)
    for uid in add_users:
        await manager.send_personal_message({'topic': protocol.WIRE_PLAYER, 'merge': True, 'ids': list(add_users - {uid})}, uid)
    await send_groups_snapshot(world_id)


async def unwire_players(world_id: str, user_id: str, payload: dict):
    users_id = payload['users_id']
    # remove faraway users from confirm structure
    await redis_connector.rem_users_from_user(world_id, user_id, *users_id)

    rem_groups_id = set()
    add_users_id = set()

    for uid in users_id:
        rem_groups_id.update(await redis_connector.get_user_groups(world_id, uid))

    for rgid in rem_groups_id:
        add_users_id.update(await redis_connector.get_group_users(world_id, rgid))

    add_users_id = add_users_id - set(users_id) - {user_id}

    users_in_my_group = set()
    my_groups = await redis_connector.get_user_groups(world_id, user_id)
    for guid in my_groups:
        users_in_my_group.update(await redis_connector.get_group_users(world_id, guid))

    add_users_id &= users_in_my_group
    groups_to_remove = []

    if rem_groups_id:
        # remove user from groups where the faraway users are
        # rem user_id from rem_groups_ids
        # return close rooms aswell
        await handle_actions({'rem-user-from-groups': {'worldId': world_id, 'peerId': user_id, 'groupIds': rem_groups_id}})
        groups_to_remove = await redis_connector.rem_groups_from_user(world_id, user_id, *rem_groups_id)
        await handle_actions(groups_to_remove)
        groups_to_remove = groups_to_remove['close-room']
    if add_users_id:
        # add user to a new group with the still nearby users
        logger.info(f'[UNWIRE] user {user_id} criou o grupo')
        next_group_id = await redis_connector.get_next_group()
        await handle_actions(await redis_connector.add_users_to_group(world_id, next_group_id, *[user_id, *add_users_id]))

    await manager.send_personal_message({'topic': protocol.UNWIRE_PLAYER, 'groups': groups_to_remove, 'merge': True, 'ids': users_id}, user_id)
    await send_groups_snapshot(world_id)


async def join_conference(world_id: str, user_id: str, payload: dict):
    conference_id = payload['conference_id']
    groups_id = await redis_connector.get_user_groups(world_id, user_id)

    groups_to_remove = []

    if groups_id:
        groups_to_remove = await redis_connector.rem_groups_from_user(world_id, user_id, *groups_id)
        await handle_actions(groups_to_remove)
        groups_to_remove = groups_to_remove['close-room']

        for gid in groups_id:
            for uid in await redis_connector.get_group_users(world_id, gid):
                await manager.send_personal_message({
                    'topic': protocol.UNWIRE_PLAYER, 'merge': True,
                    'groups': groups_to_remove,
                    'ids': [user_id]
                }, uid)
    await redis_connector.add_users_to_group(world_id, conference_id, user_id)
    await redis_connector.delete(f"world:{world_id}:user:{user_id}:users")

    permission = await redis_connector.can_talk_conference(world_id, user_id)
    await join_as_new_peer_or_speaker(world_id, conference_id, user_id, permission)

    conference_users = set(await redis_connector.get_group_users(world_id, conference_id))
    await manager.send_personal_message({
        'topic': protocol.WIRE_PLAYER, 'merge': False,
        'ids': list(conference_users - {user_id})
    }, user_id)
    for uid in conference_users:
        if uid != user_id:
            await manager.send_personal_message({
                'topic': protocol.WIRE_PLAYER, 'merge': True,
                'ids': [user_id]
            }, uid)

    await send_groups_snapshot(world_id)


async def send_to_conf_managers(world_id: str, user_id: str, payload: dict):
    conference = payload['conference']

    await manager.broadcast_to_conf_managers(
        world_id=world_id,
        payload={'topic': protocol.REQUEST_TO_SPEAK, 'd': {'user_requested': user_id}},
        conference=conference)


async def send_to_conf_listener(world_id: str, user_id: str, payload: dict):
    # check if user_id has permission to accept requests to speak here
    if not (await redis_connector.can_manage_conferences(world_id, user_id)):
        return

    conference = payload['conference']
    permission = payload['permission']
    user_requested = payload['user_requested']

    if permission:
        await add_speaker(world_id, conference, user_requested)

    await manager.send_personal_message(
        {'topic': protocol.PERMISSION_TO_SPEAK, 'd': {'permission': permission}},
        user_requested)


async def add_user_files(world_id: str, user_id: str, payload: dict):
    if (await redis_connector.get_user_files_len(world_id, user_id)) <= 3:
        files = payload['files']
        for file_data in files:
            await redis_connector.add_user_file(world_id, user_id, file_data)

        await manager.broadcast_to_user_rooms(world_id, {'topic': protocol.ADD_USER_FILES, 'd': {'files': files}}, user_id)
        await manager.send_personal_message({'topic': protocol.ADD_USER_FILES, 'd': {'files': files}}, user_id)


async def remove_user_file(world_id: str, user_id: str, payload: dict):
    file_data = payload['file']
    await redis_connector.remove_user_file(world_id, user_id, file_data)
    await manager.broadcast_to_user_rooms(world_id, {'topic': protocol.REMOVE_USER_FILE, 'd': {'file': file_data}}, user_id)


async def remove_all_user_files(world_id: str, user_id: str):
    await manager.broadcast_to_user_rooms(world_id, {'topic': protocol.REMOVE_ALL_USER_FILES, 'd': {'user_id': user_id}}, user_id)
    await redis_connector.remove_all_user_files(world_id, user_id)


async def get_room_users_files(world_id: str, user_id: str):
    users_ids = await redis_connector.get_user_users(world_id, user_id)
    list_of_files = []
    for uid in users_ids:
        list_of_files.extend(await redis_connector.get_user_files(world_id, uid))

    await manager.send_personal_message(
        {'topic': protocol.GET_ROOM_USERS_FILES, 'd': {'files': list_of_files}},
        user_id)


async def download_request(world_id: str, user_id: str, payload: dict):
    file_data = payload['file']
    await manager.send_personal_message(
        {'topic': protocol.DOWNLOAD_REQUEST, 'd': {'file': file_data, 'user_id': user_id}},
        str(file_data['owner']))


async def deny_download_request(world_id: str, payload: dict):
    user_id = payload['d']['user_id']
    reason = payload['d']['reason']
    await manager.send_personal_message(
        {'topic': protocol.DENY_DOWNLOAD_REQUEST, 'd': {'user_id': user_id, 'reason': reason}},
        str(user_id))


async def accept_download_request(world_id: str, payload: dict):
    user_id = payload['d']['user_id']
    file_data = payload['d']['file']
    await manager.send_personal_message(
        {'topic': protocol.ACCEPT_DOWNLOAD_REQUEST, 'd': {'file': file_data}},
        str(user_id))


async def start_download(world_id: str, payload: dict):
    user_id = payload['d']['user_id']
    await manager.send_personal_message(
        {'topic': protocol.START_DOWNLOAD},
        str(user_id))


async def leave_conference(world_id: str, user_id: str, payload: dict):
    conference_id = payload["conference_id"]

    await handle_actions({'rem-user-from-groups': {'worldId': world_id, 'peerId': user_id, 'groupIds': [conference_id]}})
    await handle_actions(await redis_connector.rem_groups_from_user(world_id, user_id, conference_id))

    await manager.send_personal_message({
        'topic': protocol.UNWIRE_PLAYER, 'merge': False,
        'groups': conference_id,
        'ids': []
    }, user_id)
    for uid in await redis_connector.get_group_users(world_id, conference_id):
        if uid != user_id:
            await manager.send_personal_message({
                'topic': protocol.UNWIRE_PLAYER, 'merge': True,
                'ids': [user_id]
            }, uid)

    await send_groups_snapshot(world_id)


async def disconnect_user(world_id: str, user_id: str):
    group_ids = set()
    group_ids.update(await redis_connector.get_user_groups(world_id, user_id))
    groups_to_remove = []
    users_in_groups = set()
    if group_ids:
        await handle_actions({'rem-user-from-groups': {'worldId': world_id, 'peerId': user_id, 'groupIds': group_ids}})
        for gid in group_ids:
            users_in_groups.update(await redis_connector.get_group_users(world_id, gid))
        groups_to_remove = await redis_connector.rem_groups_from_user(world_id, user_id, *group_ids)
        await handle_actions(groups_to_remove)
        groups_to_remove = groups_to_remove['close-room']
        for uid in users_in_groups:
            if uid != user_id:
                await manager.send_personal_message({
                    'topic': protocol.UNWIRE_PLAYER, 'merge': True,
                    'groups': groups_to_remove,
                    'ids': [user_id]
                }, uid)

    await manager.broadcast_to_user_rooms(world_id, {'topic': protocol.REMOVE_ALL_USER_FILES, 'd': {'user_id': user_id}}, user_id)
    await redis_connector.remove_all_user_files(world_id, user_id)


async def handle_actions(actions: dict):
    logger.info(actions)
    if 'add-users-to-room' in actions:
        add_users = actions['add-users-to-room']
        for add_action in add_users:
            await join_as_new_peer_or_speaker(add_action['worldId'], add_action['roomId'], add_action['peerId'])
    if 'close-room' in actions:
        close_rooms = actions['close-room']
        for close_action in close_rooms:
            media_server = await redis_connector.remove_room(close_action['roomId'])
            if media_server:
                await destroy_room(close_action['worldId'], close_action['roomId'], media_server)
    if 'rem-user-from-groups' in actions:
        rem_action = actions['rem-user-from-groups']
        await remove_user(rem_action['worldId'], rem_action['groupIds'], rem_action['peerId'])


async def remove_user(word_id: str, room_ids: list, user_id: str):
    payload = {'topic': "remove-user-from-groups",
               'd': {'roomIds': list(room_ids), 'peerId': user_id}}

    await rabbit_handler.publish(payload)


async def join_as_new_peer_or_speaker(word_id: str, room_id: str, user_id: str, permission: bool = True):
    """
    join-as-new-peer:
        create a room if it doesnt exit and add that user to that room
        then media server returns receive transport options to amqp
        this should only allow to receive data
    join-as-speaker:
        this does the same as above, except it allows
        the user to speak, so, it returns two kinds of transport,
        one for receiving and other for sending
    """
    if permission:
        payload = {'topic': protocol.JOIN_AS_SPEAKER, 'd': {'roomId': room_id, 'peerId': user_id}}
    else:
        payload = {'topic': protocol.JOIN_AS_NEW_PEER, 'd': {'roomId': room_id, 'peerId': user_id}}
    await rabbit_handler.publish(payload)


async def add_speaker(word_id: str, room_id: str, user_id: str):
    """
    add-speaker:
        allows an user that is already in a room call but only
        receiving data streams to start sending audio and video
    """
    payload = {'topic': protocol.ADD_SPEAKER, 'd': {'roomId': room_id, 'peerId': user_id}}
    await rabbit_handler.publish(payload)


async def destroy_room(word_id: str, room_id: str, media_server: str):
    payload = {'topic': "destroy-room", 'd': {'roomId': room_id}}
    logger.info(media_server)
    await rabbit_handler.publish(payload, media_server)


async def handle_transport_or_track(world_id: str, user_id: str, payload: dict):
    payload['d']['peerId'] = user_id
    room_id = payload['d']['roomId']
    if (await redis_connector.user_in_group(world_id, user_id, room_id)):
        await rabbit_handler.publish(payload)


async def close_media(world_id: str, user_id: str, payload: dict):
    payload['d'] = {'peerId': user_id}

    groupIds = await redis_connector.get_user_groups(world_id, user_id)

    for roomId in groupIds:
        payload['d']['roomId'] = roomId
        # close in media server producer
        await rabbit_handler.publish(payload)

    # broadcast for peers to close this stream
    await manager.broadcast_to_user_rooms(
        world_id,
        {'topic': protocol.CLOSE_MEDIA,
            'peerId': user_id},
        user_id)


async def toggle_producer(world_id: str, user_id: str, payload: dict):
    kind = payload['d']['kind']
    pause = payload['d']['pause']
    payload['d']['peerId'] = user_id

    groupIds = await redis_connector.get_user_groups(world_id, user_id)

    for roomId in groupIds:
        payload['d']['roomId'] = roomId
        # pause in media server producer
        await rabbit_handler.publish(payload)

    # broadcast for peers to update UI toggle buttons
    await manager.broadcast_to_user_rooms(
        world_id,
        {'topic': protocol.TOGGLE_PEER_PRODUCER,
            'peerId': user_id,
            'kind': kind,
            'pause': pause},
        user_id)


async def speaking_change(world_id: str, user_id: str, payload: dict):
    value = payload['d']['value']

    await manager.broadcast_to_user_rooms(
        world_id,
        {'topic': protocol.ACTIVE_SPEAKER,
            'peerId': user_id,
            'value': value},
        user_id)
