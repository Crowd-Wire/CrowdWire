"""
Inspiration from: https://gist.github.com/mminer/34d4746fa82b75182ee7
"""
from functools import wraps
import pickle
from .connection import redis_connector
from loguru import logger


def cache(model: str):
    def decorator(func):
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
                'model': f"{function_name}-Entity",
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
                'model': model,
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

    return decorator


def intersect(a, b):
    return dict(set(a.items()) & set(b.items()))


async def clear_cache_by_model(model_name: str, *args, **kwargs):
    """
    Deletes cache from Redis based on model name
    @param model_name: a name of a model
    @param args: optional args passed
    @param kwargs: kwargs passed to filter Redis key we want to delete from cache
    """
    keys = await redis_connector.scan_match(model_name)
    for key in keys[1]:
        deserialized_value = pickle.loads(key)
        saved_kwargs = deserialized_value['kwargs']
        intersect_kwargs = intersect(saved_kwargs, kwargs)
        if bool(intersect_kwargs):
            logger.debug("Deleted from cache")
            await redis_connector.delete(key)
