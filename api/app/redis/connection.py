import pickle
from typing import Optional, List, Union

import aioredis
from app.core.config import settings
from app.schemas import RoleInDB
from app.utils import generate_guest_username, choose_avatar
from app import schemas, models
from uuid import uuid4
from loguru import logger
from app.core import strings


class RedisConnector:

    def __init__(self):
        self.sentinel_pool = None
        self.master = None

    async def sentinel_connection(self):
        logger.info(settings.REDIS_SENTINEL_HOST, settings.REDIS_SENTINEL_PORT)
        self.sentinel_pool = await aioredis.sentinel.create_sentinel(
            [(settings.REDIS_SENTINEL_HOST, settings.REDIS_SENTINEL_PORT)],
            password=settings.REDIS_SENTINEL_PASSWORD, timeout=2)
        self.master = await self.sentinel_pool.master_for(settings.REDIS_MASTER)
        # uncomment this to reset redis everytime
        # self.master = await aioredis.create_connection('redis://localhost/0')
        # await self.master.execute('flushall')
        await self.add_users_to_world('1', '20')

        if not (await redis_connector.key_exists('media_server_1')):
            await redis_connector.hset('media_server_1', 'num_rooms', 0)

    async def execute(self, *args, **kwargs) -> any:
        return await self.master.execute(*args, **kwargs)

    async def key_exists(self, key: str):
        return await self.master.execute('exists', key)

    async def get(self, key: str) -> any:
        return await self.master.execute('get', key)

    async def delete(self, key: Union[str, bytes]):
        return await self.master.execute('del', key)

    async def set(self, key: str, value: str) -> any:
        return await self.master.execute('set', key, value)

    async def scan_match(self, matcher: str) -> List[Union[str, List[str]]]:
        """Scans keys that contain a matcher string"""
        return await self.master.execute('scan', 0, 'match', f"*{matcher}*")

    async def scan_match_all(self, matcher: str) -> List[str]:
        """Scans keys that contain a matcher string"""
        cursor = 0
        all_keys = []
        while cursor != b'0':
            cursor, keys = await self.master.execute('scan', cursor, 'match', f"*{matcher}*")
            all_keys.extend(keys)
        return all_keys

    async def hget(self, key: str, field: any):
        # TODO: CHECK ENCODINGS!
        return await self.master.execute('hget', key, field)

    async def hset(self, key: str, field: str, value: any):
        return await self.master.execute('hset', key, field, value)

    async def sadd(self, key: str, member: str, *members):
        """Adds one or more members to a set"""
        return await self.master.execute('sadd', key, member, *members)

    async def lrange(self, key: str, start: int, finish: int):
        """Gets the items of a list from indexes start to finish"""
        return await self.master.execute('lrange', key, start, finish)

    async def lpush(self, key: str, item: any):
        """Adds one item to a list"""
        return await self.master.execute('lpush', key, item)

    async def llen(self, key: str):
        """Checks the length of the list"""
        return await self.master.execute('llen', key)

    async def lrem(self, key: str, occurences: str, item: any):
        """Removes the number of occurences that match an item"""
        return await self.master.execute('lrem', key, occurences, item)

    async def scard(self, key: str):
        """Get the number of members in a set"""
        return await self.master.execute('scard', key, encoding="utf-8")

    async def sismember(self, key: str, member: str) -> int:
        """Determine if a given value is a member of a set"""
        return await self.master.execute('sismember', key, member)

    async def smembers(self, key: str):
        """Get all the members in a set"""
        return await self.master.execute('smembers', key, encoding='utf-8')

    async def srem(self, key: str, member: str, *members):
        """Remove one or more members from a set"""
        return await self.master.execute('srem', key, member, *members)

    async def add_media_server(self):
        media_servers = await self.scan_match_all('media_server_')
        num_servers = str(len(media_servers) + 1)
        logger.info(num_servers)
        new_media_server = 'media_server_' + num_servers
        logger.info(new_media_server)
        if not (await redis_connector.key_exists(new_media_server)):
            await redis_connector.hset(new_media_server, 'num_rooms', 0)

    async def get_media_server(self):
        """Get the media server that currently has the less amount of room calls associated"""
        media_servers = await self.scan_match_all('media_server_')
        least_rooms_media_server = 'media_server_1'
        min_rooms = await self.hget('media_server_1', 'num_rooms')
        for media_server in media_servers:
            media_server = media_server.decode()
            num_rooms = await self.hget(media_server, 'num_rooms')
            if num_rooms < min_rooms:
                min_rooms = num_rooms
                least_rooms_media_server = media_server
        return least_rooms_media_server, int(min_rooms.decode())

    async def add_room_to_media_server(self, group_id: str):
        """Associate new room with the media server that has the least rooms"""
        media_server, num_rooms = await self.get_media_server()
        await self.hset(media_server, 'num_rooms', num_rooms + 1)
        await self.set('room_' + group_id, media_server)

    async def remove_room(self, group_id: str):
        """Remove room from redis and decrease number of rooms of media server"""
        media_server = await self.get('room_' + group_id)
        logger.info(media_server)
        if media_server:
            logger.info("Entered If condition")
            media_server = media_server.decode()
            num_rooms = int((await self.hget(media_server, 'num_rooms')).decode()) - 1
            if num_rooms <= 0:
                num_rooms = 0
            await self.hset(media_server, 'num_rooms', num_rooms)
            await self.delete('room_' + group_id)
        return media_server

    async def user_in_group(self, world_id: str, user_id: str, group_id: str) -> int:
        """Determine if a given user is a member of a group"""
        return await self.sismember(f"world:{str(world_id)}:user:{str(user_id)}:groups", group_id)

    async def save_world_user_data(self, world_id: int, user_id: Union[int, uuid4], data: dict):
        """
        saves a  new user that joined into a world,
        alongside its data. The @param user_id can also
        be a string of the uuid for guests
        """
        for k, v in data.items():
            await self.hset(f"world:{str(world_id)}:{str(user_id)}", k, pickle.dumps(v))

    async def get_online_users(self, world_id: int) -> int:
        """
        gets the number of online users in a world
        """
        key = f"world:{world_id}:onlineusers"
        value = await self.get(key)

        if not value or not value.decode().isdecimal():
            return 0
        return int(value.decode())

    async def update_online_users(self, world_id: int, offset: int) -> int:
        """
        updates the number of online users in a world
        @return: an integer with the number of  updated online users at the moment
        """
        key = f"world:{world_id}:onlineusers"
        # verify is key exists and has is an integer
        value = await self.get_online_users(world_id)
        updated_number = value + offset
        value = str(updated_number)
        if updated_number < 0:
            value = "0"
        await self.set(key=key, value=value)
        return updated_number

    async def join_new_guest_user(self, world_id: int, user_id: uuid4, role: models.Role) \
            -> schemas.World_UserWithRoleInDB:
        """
        Generates a username for guests and the user the @method save_world_user_data
        to store the user data
        @return : a schema of a World User taking into consideration Redis Stored Values
        """
        logger.info(user_id)
        username = generate_guest_username(user_id)
        avatar = choose_avatar()
        await self.save_world_user_data(
            world_id=world_id,
            user_id=user_id,
            data={'username': username, 'avatar': avatar, 'role': role}
        )
        return schemas.World_UserWithRoleInDB(
            world_id=world_id,
            user_id=user_id,
            username=username,
            avatar=avatar,
            role=RoleInDB(**role.__dict__)
        )

    async def get_world_user_data(self, world_id: int, user_id: Union[int, uuid4]) \
            -> Optional[schemas.World_UserWithRoleInDB]:
        """
        Checks World_User Data, if present, to be returned to REST API
        @return: a schema of a World User taking into consideration Redis Stored Values
        """
        # TODO: maybe check encoding instead of converting to string
        username = await self.hget(
            f"world:{str(world_id)}:{str(user_id)}", 'username')
        avatar = await self.hget(
            f"world:{str(world_id)}:{str(user_id)}", 'avatar')
        role = await self.hget(
            f"world:{str(world_id)}:{str(user_id)}", 'role'
        )

        if username and avatar and role:
            data = {
                'username': pickle.loads(username),
                'avatar': pickle.loads(avatar),
                'role': pickle.loads(role).__dict__
            }
            return schemas.World_UserWithRoleInDB(
                world_id=world_id,
                user_id=user_id,
                avatar=data['avatar'],
                username=data['username'],
                role=schemas.RoleInDB(**data['role'])
            )

        return None

    async def get_world_user_data_dict(self, world_id: int, user_id: Union[int, uuid4]) \
            -> Optional[dict]:
        """
        Checks World_User Data if present
        @return: a schema of a World User taking into consideration Redis Stored Values
        """
        # TODO: maybe check encoding instead of converting to string
        user_id = str(user_id)
        world_id = str(world_id)
        username = await self.hget(
            f"world:{world_id}:{user_id}", 'username')
        avatar = await self.hget(
            f"world:{world_id}:{user_id}", 'avatar')
        role = await self.hget(
            f"world:{world_id}:{user_id}", 'role'
        )

        if username and avatar and role:
            role = pickle.loads(role).__dict__
            return {
                'username': pickle.loads(username),
                'avatar': pickle.loads(avatar),
                'role': {'role_id': role['role_id'], 'name': role['name']},
            }

        return None

    async def assign_role_to_user(self, world_id: int, role: models.Role, user_id: int, is_guest: bool):

        # updates the cache for the user and guest
        world_user_data = await self.get_world_user_data(world_id=world_id, user_id=user_id)
        if world_user_data is None:
            # if there is no information about the guest in cache then it has not joined this world
            if is_guest:
                return None, strings.USER_NOT_IN_WORLD
        else:
            if world_user_data.role.role_id == role.role_id:
                # if the role is not going to change, it is better to return it already
                return world_user_data, ""

            await self.save_world_user_data(
                world_id=world_id,
                user_id=user_id,
                data={'role': role}
            )
            world_user_data.role = role
            return world_user_data, ""

        return None, ""

    async def can_talk_conference(self, world_id: int, user_id: Union[int, uuid4]) \
            -> bool:
        """
        Checks World_User Data, if present, to be returned to REST API
        @return: a schema of a World User taking into consideration Redis Stored Values
        """
        role = await self.hget(
            f"world:{str(world_id)}:{str(user_id)}", 'role'
        )

        if role:
            role = pickle.loads(role).__dict__
            return role['talk_conference']
        return False

    async def can_manage_conferences(self, world_id: int, user_id: Union[int, uuid4]) \
            -> bool:
        """
        Checks World_User Data, if present, to be returned to REST API
        @return: a schema of a World User taking into consideration Redis Stored Values
        """
        role = await self.hget(
            f"world:{str(world_id)}:{str(user_id)}", 'role'
        )

        if role:
            role = pickle.loads(role).__dict__
            return role['conference_manage']
        return False

    async def get_user_position(self, world_id: str, user_id: str) -> dict:
        """Get last user position received"""
        pairs = await self.master.execute('hgetall',
                                          f"world:{world_id}:user:{user_id}:position", encoding="utf-8")
        return {k: float(v) for k, v in zip(pairs[::2], pairs[1::2])}

    async def set_user_position(self, world_id: str, user_id: str, position: dict):
        """Update last user position received"""
        return await self.master.execute('hmset',
                                         f"world:{world_id}:user:{user_id}:position", 'x', position['x'],
                                         'y', position['y'])

    async def get_world_users(self, world_id: str):
        return await self.smembers(f"world:{world_id}:users")

    async def add_users_to_world(self, world_id: str, user_id: str, *users_id: List[str]):
        return await self.sadd(f"world:{world_id}:users", user_id, *users_id)

    async def rem_users_from_world(self, world_id: str, user_id: str, *users_id: List[str]):
        return await self.srem(f"world:{world_id}:users", user_id, *users_id)

    async def get_user_users(self, world_id: str, user_id: str):
        """Get nearby users from a user"""
        return await self.smembers(f"world:{world_id}:user:{user_id}:users")

    async def get_user_groups(self, world_id: str, user_id: str):
        """Get groups from a user"""
        return await self.smembers(f"world:{world_id}:user:{user_id}:groups")

    async def get_group_users(self, world_id: str, group_id: str):
        """Get users from a group"""
        return await self.smembers(f"world:{world_id}:group:{group_id}")

    async def add_users_to_user(self, world_id: str, user_id: str, found_user_id: str, *found_users_id: List[str]):
        """Add one ore more found users to a user"""
        found_users_id = [found_user_id, *found_users_id]
        await self.sadd(f"world:{world_id}:user:{user_id}:users", *found_users_id)

    async def add_users_to_group(self, world_id: str, group_id: str, user_id: str, *users_id: List[str]):
        """
        Add one or more users to a groups
        Returns a dictionary with actions made to groups and users
        """

        actions = {"add-users-to-room": [], "close-room": []}
        users_id = [user_id, *users_id]
        all_users_id = set(users_id) | set(await self.get_group_users(world_id, group_id))

        """Normalize groups before addition"""
        inter_groups_id = set()
        for uid in users_id:
            inter_groups_id.update(await self.get_user_groups(world_id, uid))
        inter_groups_id.discard(group_id)

        mem_group_users_id = {}

        for igid in inter_groups_id:
            if igid not in mem_group_users_id:
                mem_group_users_id[igid] = [set(await self.get_group_users(world_id, igid)), 0]

            for iuid in mem_group_users_id[igid][0]:
                near_users_id = set() if iuid not in users_id else set(all_users_id)
                for ugid in await self.get_user_groups(world_id, iuid):
                    if ugid not in mem_group_users_id:
                        if ugid == group_id:
                            mem_group_users_id[group_id] = [set(all_users_id), 0]
                        else:
                            mem_group_users_id[ugid] = [set(await self.get_group_users(world_id, ugid)), 0]
                    near_users_id |= mem_group_users_id[ugid][0]

                if near_users_id.issuperset(all_users_id):
                    mem_group_users_id[igid][1] += 1

        mem_group_users_id = dict(filter(lambda x: x[0] in inter_groups_id, mem_group_users_id.items()))

        # find lowest mergeable group id
        mergeable_groups_id = {group_id}
        for mgid, (_, c) in mem_group_users_id.items():
            if c == await self.scard(f"world:{world_id}:group:{mgid}"):
                mergeable_groups_id.add(mgid)
        lowest_group_id = min(mergeable_groups_id)
        mergeable_groups_id.remove(lowest_group_id)

        new_group_created = True

        for mgid in mergeable_groups_id:

            if mgid == group_id:
                new_group_created = False
                mem_users_id = all_users_id
            else:
                actions['close-room'].append({'worldId': world_id, 'roomId': mgid})
                mem_users_id = mem_group_users_id[mgid][0]

            await self.rem_group(world_id, mgid)

            # add users to lowest group id
            await self.sadd(f"world:{world_id}:group:{lowest_group_id}", *mem_users_id)
            for muid in mem_users_id:
                if not (await self.user_in_group(world_id, muid, lowest_group_id)):
                    actions["add-users-to-room"].append(
                        {'peerId': muid, 'roomId': lowest_group_id, 'worldId': world_id})
                    await self.sadd(f"world:{world_id}:user:{muid}:groups", lowest_group_id)

        """Store in redis group associated to a media server"""
        if new_group_created:
            await self.add_room_to_media_server(group_id)

        """Add users to the normalized group"""
        if not mergeable_groups_id:
            await self.sadd(f"world:{world_id}:group:{lowest_group_id}", *users_id)
            for uid in users_id:
                if not (await self.user_in_group(world_id, uid, lowest_group_id)):
                    actions["add-users-to-room"].append({'peerId': uid, 'roomId': lowest_group_id, 'worldId': world_id})
                    await self.sadd(f"world:{world_id}:user:{uid}:groups", lowest_group_id)

        return actions

    async def add_groups_to_user(self, world_id: str, user_id: str, group_id: str, *groups_id: List[str]):
        """Add one or more groups to a user"""
        groups_id = [group_id, *groups_id]
        logger.debug(f'add_groups_to_user({user_id}, {groups_id})')
        for gid in groups_id:
            await self.add_users_to_group(world_id, gid, user_id)

    async def rem_group(self, world_id: str, group_id: str):
        """Remove group from world"""
        for uid in await self.smembers(f"world:{world_id}:group:{group_id}"):
            await self.srem(f"world:{world_id}:user:{uid}:groups", group_id)
        await self.delete(f"world:{world_id}:group:{group_id}")

    async def rem_users_from_user(self, world_id: str, user_id: str, lost_user_id: str, *lost_users_id: List[str]):
        lost_users_id = [lost_user_id, *lost_users_id]
        await self.srem(f"world:{world_id}:user:{user_id}:users", *lost_users_id)

    async def rem_users_from_group(self, world_id: str, group_id: str, user_id: str, *users_id: List[str]):
        """Remove one or more users from a group"""
        """Returns a dictionary with actions made to groups and users"""

        actions = []

        """Remove users"""
        users_id = [user_id, *users_id]
        await self.srem(f"world:{world_id}:group:{group_id}", *users_id)
        for uid in users_id:
            await self.srem(f"world:{world_id}:user:{uid}:groups", group_id)

        # hack to avoid removing conference groups
        if group_id[0] == 'C':
            return actions

        """Normalize groups after remove"""
        if await self.scard(f"world:{world_id}:group:{group_id}") <= 1:
            actions.append({'worldId': world_id, 'roomId': group_id})
            # remove group when one or none inner users
            await self.rem_group(world_id, group_id)
        else:
            # check if the group removed is now subgroup of another
            left_users = await self.get_group_users(world_id, group_id)
            inter_groups_id = set()
            for uid in left_users:
                inter_groups_id.update(await self.get_user_groups(world_id, uid))
            inter_groups_id.discard(group_id)

            for igid in inter_groups_id:
                if set(await self.get_group_users(world_id, igid)).issuperset(set(left_users)):
                    # remove redundant group
                    actions.append({'worldId': world_id, 'roomId': group_id})
                    await self.rem_group(world_id, group_id)
                    break

        return actions

    async def rem_groups_from_user(self, world_id: str, user_id: str, group_id: str, *groups_id: List[str]):
        """Remove one or more groups from a user
        Returns a dictionary with actions made to groups and users"""
        actions = {}
        groups_id = [group_id, *groups_id]
        for gid in groups_id:
            actions['close-room'] = (await self.rem_users_from_group(world_id, gid, user_id))
        return actions

    async def get_user_files(self, world_id: str, user_id: str) -> List[dict]:
        """Get a list of files associated to a user"""
        file_list = await self.lrange(f"world:{str(world_id)}:user:{str(user_id)}:files", 0, 2)
        return [pickle.loads(x) for x in file_list]

    async def add_user_file(self, world_id: str, user_id: str, file_data: dict) -> any:
        """Add a file to the user list of files"""
        return await self.lpush(f"world:{str(world_id)}:user:{str(user_id)}:files", pickle.dumps(file_data))

    async def remove_user_file(self, world_id: str, user_id: str, file_data: dict) -> any:
        """Remove a file from the user list of files"""
        return await self.lrem(f"world:{str(world_id)}:user:{str(user_id)}:files", 1, pickle.dumps(file_data))

    async def remove_all_user_files(self, world_id: str, user_id: str) -> any:
        """Remove a file from the user list of files"""
        return await self.delete(f"world:{str(world_id)}:user:{str(user_id)}:files")

    async def get_user_files_len(self, world_id: str, user_id: str) -> int:
        """Get the length of the user list of file"""
        return await self.llen(f"world:{str(world_id)}:user:{str(user_id)}:files")


redis_connector = RedisConnector()
