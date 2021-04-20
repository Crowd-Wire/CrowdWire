from fastapi import HTTPException
from typing import Optional, Any, Union
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, crud, models
from app.api import dependencies as deps
from loguru import logger
from app.redis import redis_connector
from app.utils import is_guest_user
from app.core import strings

router = APIRouter()


@router.get("/{world_id}", response_model=schemas.WorldMapInDB)
async def get_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
) -> Any:
    if not is_guest_user(user):
        db_world, message = await crud.crud_world.get(db=db, world_id=world_id)
    else:
        db_world, message = await crud.crud_world.get_available_for_guests(
            db=db, world_id=world_id
        )
    if not db_world:
        raise HTTPException(
            status_code=400,
            detail=message,
        )
    return db_world


@router.get("/{world_id}/users", response_model=schemas.World_UserInDB)
async def join_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
) -> Any:
    """
    Registers a User in a World and returns the Information as a world_user object
    """
    if not is_guest_user(user):
        # checks if the world is available for him
        world_obj, msg = await crud.crud_world.get_available(db=db, world_id=world_id, user_id=user.user_id)
        if not world_obj:
            raise HTTPException(status_code=400, detail=msg)
        # verify if the user is already in redis cache
        # If it's not the first time the user has joined the world, get it from redis(cache)
        world_user = await redis_connector.get_world_user_data(world_id, user.user_id)
        if not world_user:
            # Otherwise, goes to PostgreSQL database
            world_user = await crud.crud_world_user.join_world(db=db, _world=world_obj, _user=user)
            return world_user
    else:
        # There are some differences for guests..
        world_obj, msg = await crud.crud_world.get_available_for_guests(db=db, world_id=world_id)
        if not world_obj:
            raise HTTPException(status_code=400, detail=msg)
        world_user = await redis_connector.get_world_user_data(world_id=world_id, user_id=user.user_id)
        if not world_user:
            logger.debug('not cached:/')
            world_user = await redis_connector.join_new_guest_user(world_id=world_id, user_id=user.user_id)
    return world_user


@router.put("/{world_id}/users", response_model=schemas.World_UserInDB)
async def update_world_user_info(
        world_id: int,
        user_data: schemas.World_UserUpdate,
        db: Session = Depends(deps.get_db),
        user: Optional[models.User] = Depends(deps.get_current_user_authorizer(required=False))
) -> Any:
    """
    Update User info for a given world: username and avatar name usually
    """

    if not is_guest_user(user):
        world_user_obj = crud.crud_world_user.get_user_joined(db, world_id, user.user_id)
        if not world_user_obj:
            raise HTTPException(status_code=400, detail=strings.USER_NOT_IN_WORLD)
        # registered user
        world_user = crud.crud_world_user.update(
            db=db,
            db_obj=world_user_obj,
            obj_in=user_data
        )
    else:
        # for guest users retrieve data from redis
        # no need to verify the privacy of the world, since it already done when a user
        # joins the world for the first time
        world_user_obj = await redis_connector.get_world_user_data(world_id=world_id, user_id=user.user_id)
        if not world_user_obj:
            raise HTTPException(
                status_code=400,
                detail=strings.USER_NOT_IN_WORLD
            )
        data = {'username': user_data.username, 'avatar': user_data.avatar}
        # updates the data present
        await redis_connector.save_world_user_data(
            world_id=world_id,
            user_id=user.user_id,
            data=data
        )
        world_user = {'world_id': world_id, 'user_id': user.user_id}
        world_user.update(data)
        logger.debug(world_user)
    return world_user


@router.post("/", response_model=schemas.WorldMapInDB)
def create_world(
        *,
        world_in: schemas.WorldCreate,
        db: Session = Depends(deps.get_db),
        user: models.User = Depends(deps.get_current_user_authorizer(required=True))
) -> Any:
    world_in.creator = user
    obj, message = crud.crud_world.create(db=db, obj_in=world_in, user=user)
    if not obj:
        raise HTTPException(
            status_code=400,
            detail=message
        )

    return obj
