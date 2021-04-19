from typing import Union, Tuple, Optional

import aioredis
from app.core.config import settings
from app.utils import generate_guest_username, choose_avatar
from app import schemas
from uuid import uuid1


class RedisConnector:

    def __init__(self):
        self.sentinel_pool = None
        self.master = None

    async def sentinel_connection(self):
        self.sentinel_pool = await aioredis.sentinel.create_sentinel_pool(
            [(settings.REDIS_SENTINEL_HOST, settings.REDIS_SENTINEL_PORT)],
            password=settings.REDIS_SENTINEL_PASSWORD)

        self.master = self.sentinel_pool.master_for(settings.REDIS_MASTER)

    async def key_exists(self, key: str):
        return await self.master.execute('exists', key)

    async def get(self, key: str) -> any:
        return await self.master.execute('get', key)

    async def set(self, key: str, value: str) -> any:
        return await self.master.execute('set', key, value)

    async def execute(self, *args, **kwargs) -> any:
        return await self.master.execute(*args, **kwargs)

    async def hget(self, key: str, field: str):
        return await self.master.execute('hget', key, field, encoding='utf-8')

    async def hset(self, key: str, field: str, value: str):
        return await self.master.execute('hset', key, field, value)

    async def save_world_user_data(self, world_id: int, user_id: Union[int, uuid1], data: dict):
        """
        saves a  new user that joined into a world,
        alongside its data. The @param user_id can also
        be a string of the uuid for guests
        """
        for k, v in data.items():
            await self.hset(f"world:{str(world_id)}:{str(user_id)}",
                            k, v)

    async def join_new_guest_user(self, world_id: int, user_id: uuid1) -> schemas.World_UserInDB:
        """
        Generates a username for guests and the user the @method save_world_user_data
        to store the user data
        @return : a schema of a World User taking into consideration Redis Stored Values
        """
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

    async def get_world_user_data(self, world_id: int, user_id: Union[int, uuid1]) -> Optional[schemas.World_UserInDB]:
        """
        Checks World_User Data, if present, to be returned to REST API if present
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


redis_connector = RedisConnector()
