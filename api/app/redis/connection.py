import aioredis
from app.core.config import settings


class RedisConnector:

    def __init__(self):
        self.sentinel_pool = None
        self.master = None

    async def sentinel_connection(self):

        self.sentinel_pool = await aioredis.sentinel.create_sentinel_pool(
            [(settings.REDIS_SENTINEL_HOST, settings.REDIS_SENTINEL_PORT)],
            password=settings.REDIS_SENTINEL_PASSWORD)

        self.master = self.sentinel_pool.master_for(settings.REDIS_MASTER)

    async def get(self, key: str) -> any:

        return await self.master.execute('get', key)

    async def set(self, key: str, value: str) -> any:

        return await self.master.execute('set', key, value)

    async def execute(self, *args, **kwargs) -> any:

        return await self.master.execute(*args, **kwargs)

    async def hget(self, key: str, field: str):

        return await self.master.execute('hget', key, field)

    async def hset(self, key: str, field: str, value: str):

        return await self.master.execute('hset', key, field, value)


redis_connector = RedisConnector()
