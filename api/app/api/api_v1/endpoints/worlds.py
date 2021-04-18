from fastapi import HTTPException
from typing import Optional, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, crud, models
from app.api import dependencies as deps
from loguru import logger
from app.redis import redis_connector


from app.core import strings

router = APIRouter()


@router.get("/{world_id}", response_model=schemas.WorldMapInDB)
def get_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Optional[models.User] = Depends(deps.get_current_user_authorizer(required=False)),
) -> Any:
    if user:
        logger.debug(f"Registered User {user.name} joining in")
        db_world = crud.crud_world.get(db, world_id)
        return db_world
    else:
        raise HTTPException(
            status_code=400,
            detail="Guest User cant join yet. Not Implemented.",
        )


@router.get("/{world_id}/users", response_model=schemas.World_UserInDB)
async def join_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Optional[models.User] = Depends(deps.get_current_user_authorizer(required=False)),
) -> Any:
    """
    Registers a User in a World and returns the Information as a world_user object
    """

    if user:
        # checks if the world is available for him
        world, msg = crud.crud_world.get_available(db, world_id=world_id, user_id=user.user_id)

        # TODO: create redis helper class
        # verify if the user is in redis cache
        user_info = await redis_connector.get_world_user_data(world_id, user.user_id)
        logger.debug(user_info)

        if user_info.get('avatar') and user_info.get('username'):
            return schemas.World_UserInDB(
                world_id=world_id,
                user_id=user.user_id,
                avatar=user_info['avatar'],
                username=user_info['username']
            )
        world_user = crud.crud_world_user.join_world(db, _world=world, _user=user)
        return world_user

    else:
        logger.debug("User is not registered")
        raise HTTPException(
            status_code=400,
            detail=strings.ACCESS_FORBIDDEN,
        )


@router.put("/{world_id}/users", response_model=schemas.World_UserInDB)
def update_world_user_info(
        world_id: int,
        user_data: schemas.World_UserUpdate,
        db: Session = Depends(deps.get_db),
        user: Optional[models.User] = Depends(deps.get_current_user_authorizer(required=False))
) -> Any:
    """
    Update User info for a given world: username and avatar name usually
    """

    if user:
        world_user_obj = crud.crud_world_user.get_user_joined(db, world_id, user.user_id)
        if not world_user_obj:
            raise HTTPException(
                status_code=400,
                detail=strings.USER_NOT_IN_WORLD
            )
        # registered user
        world_user = crud.crud_world_user.update(
            db=db,
            db_obj=world_user_obj,
            obj_in=user_data
        )
        return world_user
    else:
        # guest
        raise HTTPException(
            status_code=400,
            detail=strings.ACCESS_FORBIDDEN,
        )


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
