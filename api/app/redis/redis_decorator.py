"""
Inspiration from: https://gist.github.com/mminer/34d4746fa82b75182ee7
"""
import functools
from functools import wraps
import pickle
from .connection import redis_connector
from loguru import logger


def cache(func):

    def setup_args(_kwargs: dict) -> dict:
        """
        Pops from the kwargs of the function,
        a db session object
        """
        copy_kwargs = dict(_kwargs)
        if 'db' in copy_kwargs:
            copy_kwargs.pop('db', None)
        return copy_kwargs

    @wraps(func)
    async def wrapper(*args, **kwargs):
        function_name = func.__name__
        # remove DB session's as arguments to our Redis Key
        copy_kwargs = setup_args(kwargs)
        logger.info(function_name)
        logger.info(args)
        logger.info(kwargs)
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

    async def clear(*args, **kwargs):
        function_name = func.__name__
        copy_kwargs = setup_args(kwargs)
        logger.info(args)
        logger.info(kwargs)
        key_data = {
            'function_name': function_name,
            'args': args,
            'kwargs': copy_kwargs
        }
        key = pickle.dumps(key_data)
        if await redis_connector.key_exists(key):
            logger.debug("Cache Exists, deleting it..")
            await redis_connector.delete(key)
        return None
    wrapper.clear = clear
    return wrapper
