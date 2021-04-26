from typing import Union, Optional, List, Union

import aioredis
from app.core.config import settings
from app.utils import generate_guest_username, choose_avatar
from app import schemas
from uuid import uuid4
from loguru import logger


class RedisConnector:

    def __init__(self):
        self.sentinel_pool = None
        self.master = None

    async def sentinel_connection(self):
        self.sentinel_pool = await aioredis.sentinel.create_sentinel_pool(
            [(settings.REDIS_SENTINEL_HOST, settings.REDIS_SENTINEL_PORT)],
            password=settings.REDIS_SENTINEL_PASSWORD)

        self.master = self.sentinel_pool.master_for(settings.REDIS_MASTER)
        await self.master.execute('flushall')

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

    async def hget(self, key: str, field: str):
        return await self.master.execute('hget', key, field, encoding='utf-8')

    async def hset(self, key: str, field: str, value: str):
        return await self.master.execute('hset', key, field, value)

    async def sadd(self, key: str, member: str, *members):
        """Adds one or more members to a set"""
        return await self.master.execute('sadd', key, member, *members)

    async def scard(self, key: str):
        """Get the number of members in a set"""
        return await self.master.execute('scard', key)

    async def sismember(self, key: str, member: str):
        """Determine if a given value is a member of a set"""
        return await self.master.execute('sismember', key, member)

    async def smembers(self, key: str):
        """Get all the members in a set"""
        return await self.master.execute('smembers', key, encoding='utf-8')

    async def srem(self, key: str, member: str, *members):
        """Remove one or more members from a set"""
        return await self.master.execute('srem', key, member, *members)

    async def save_world_user_data(self, world_id: int, user_id: Union[int, uuid4], data: dict):
        """
        saves a  new user that joined into a world,
        alongside its data. The @param user_id can also
        be a string of the uuid for guests
        """
        for k, v in data.items():
            await self.hset(f"world:{str(world_id)}:{str(user_id)}",
                            k, v)

    async def join_new_guest_user(self, world_id: int, user_id: uuid4) -> schemas.World_UserInDB:
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
            data={'username': username, 'avatar': avatar}
        )
        return schemas.World_UserInDB(
            world_id=world_id,
            user_id=user_id,
            username=username,
            avatar=avatar
        )

    async def get_world_user_data(self, world_id: int, user_id: Union[int, uuid4]) -> Optional[schemas.World_UserInDB]:
        """
        Checks World_User Data, if present, to be returned to REST API
        @return: a schema of a World User taking into consideration Redis Stored Values
        """
        # TODO: maybe check encoding instead of converting to string
        data = {
            'username': await self.hget(
                f"world:{str(world_id)}:{str(user_id)}", 'username'
            ),
            'avatar': await self.hget(
                f"world:{str(world_id)}:{str(user_id)}", 'avatar'
            )
        }
        if data.get('avatar') and data.get('username'):
            return schemas.World_UserInDB(
                world_id=world_id,
                user_id=user_id,
                avatar=data['avatar'],
                username=data['username']
            )

        return None

    async def get_user_position(self, world_id: str, room_id: str, user_id: str) -> dict:
        """Get last user position received"""
        pairs = await self.master.execute('hgetall',
            f"world:{world_id}:room:{room_id}:user:{user_id}:position")
        return {k.decode(): float(v.decode()) for k, v in zip(pairs[::2],pairs[1::2])}

    async def set_user_position(self, world_id: str, room_id: str, user_id: str, position: dict):
        """Update last user position received"""
        return await self.master.execute('hmset', 
            f"world:{world_id}:room:{room_id}:user:{user_id}:position", 'x', position['x'], 'y', position['y'])

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
        return await self.sadd(f"world:{world_id}:user:{user_id}:users", *found_users_id)

    async def add_users_to_group(self, world_id: str, group_id: str, user_id: str, *users_id: List[str]):
        """Add one or more users to a groups"""
        users_id = [user_id, *users_id]
        await self.sadd(f"world:{world_id}:groups:{group_id}", *users_id)
        for uid in users_id:
            await self.sadd(f"world:{world_id}:user:{uid}:groups", group_id)

    async def add_groups_to_user(self, world_id: str, user_id: str, group_id: str, *groups_id: List[str]):
        """Add one or more groups to a user"""
        groups_id = [group_id, *groups_id]
        await self.sadd(f"world:{world_id}:user:{user_id}:groups", *groups_id)
        for gid in groups_id:
            await self.sadd(f"world:{world_id}:groups:{gid}", user_id)


redis_connector = RedisConnector()
