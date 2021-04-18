"""
Inspiration from: https://gist.github.com/mminer/34d4746fa82b75182ee7
"""
from functools import wraps
import pickle
from .connection import redis_connector
from loguru import logger


def cache(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):

        function_name = func.__name__
        # remove DB session's as arguments to our Redis Key
        copy_kwargs = dict(kwargs)
        if 'db' in copy_kwargs:
            copy_kwargs.pop('db', None)

        key_data = {
            'function_name': function_name,
            'args': args,
            'kwargs': copy_kwargs
        }

        # as we may store Python Objects it
        # may be better to use pickle to serialize them
        key = pickle.dumps(key_data)

        if await redis_connector.key_exists(key):
            logger.info(f"Using Cache for function{function_name}")
            value = pickle.loads(await redis_connector.get(key))
            data, message = value['data'], value['message']
        else:
            data, message = await func(*args, **kwargs)
            value = {
                'data': data,
                'message': message,
            }
            if data:
                await redis_connector.set(key, pickle.dumps(value))

        return data, message

    return wrapper
