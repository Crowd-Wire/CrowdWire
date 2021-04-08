import aioredis



async def sentinel_connection():

    sentinel_pool = await aioredis.sentinel.create_sentinel_pool(
        [('localhost', 26379)], password='password')

    redis = sentinel_pool.master_for('mymaster')
    test = await redis.execute('get', 'key') == b'value'
    print(test)
    #await redis.set('key1', 'value1')
    #assert await redis.get('key1', encoding='utf-8') == 'value1'


    """
    sentinel = await aioredis.create_sentinel(
        [('localhost', 26379)], password='password')
    redis = sentinel.master_for('mymaster')
    assert await redis.set('key', 'value')
    assert await redis.get('key', encoding='utf-8') == 'value'
    """