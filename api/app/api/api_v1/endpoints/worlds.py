from fastapi import HTTPException, Query
from typing import Optional, Any, List, Union
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


@router.get("/invite/{invite_token}", response_model=schemas.World_UserWithRoleAndMap)
async def join_world_by_link(
        invite_token: str = None,
        *,
        db: Session = Depends(deps.get_db),
        result=Depends(deps.get_current_user_for_invite)
):
    logger.info(invite_token)
    user, world_obj = result
    # If it's not the first time the user has joined the world, get it from redis(cache)
    world_user = await redis_connector.get_world_user_data(world_obj.world_id, user.user_id)
    if world_user:
        world_user = schemas.World_UserWithRoleAndMap(**{**world_user.dict(), **{'map': world_obj.world_map}})
        return world_user
    if not is_guest_user(user):
        # Otherwise, goes to PostgreSQL database, for registered users
        world_user, role = await crud.crud_world_user.join_world(db=db, _world=world_obj, _user=user)
        delattr(world_user, 'role_id')
        setattr(world_user, 'role', role)
        setattr(world_user, 'map', world_obj.world_map)
        return world_user
    else:
        # Saves on Redis for Guest Users
        logger.debug('not cached:/')
        world_user = await redis_connector.join_new_guest_user(world_id=world_obj.world_id, user_id=user.user_id)
        world_user = schemas.World_UserWithRoleAndMap(**{**world_user.dict(), **{'map': world_obj.world_map}})
    return world_user


@router.get("/{world_id}/users", response_model=schemas.World_UserWithRoleAndMap)
async def join_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
) -> Any:
    """
    Checks if the world is available for that type of user.
    If the user is registered it will try to get its information for that world from cache.
    If it is not there, check the database.
    For guests checks if that user was in this world by checking redis. If it is not in redis a new entry will be
    created.
    Returns the Information as a world_user object and also the role and map of the world.
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
            logger.debug("no cache")
            world_user, role = await crud.crud_world_user.join_world(db=db, _world=world_obj, _user=user)

            # pydantic schema is waiting for a role object not a role id
            delattr(world_user, 'role_id')
            setattr(world_user, 'role', role)
            setattr(world_user, 'map', world_obj.world_map)

        else:

            # adds the world map to the data from the world_user
            world_user = schemas.World_UserWithRoleAndMap(**{**world_user.dict(), **{'map': world_obj.world_map}})

    else:

        # guests cannot join worlds that dont allow guests
        world_obj, msg = await crud.crud_world.get_available_for_guests(db=db, world_id=world_id)
        if not world_obj:
            raise HTTPException(status_code=400, detail=msg)

        # This allows the same guest to join the same world without losing its data
        world_user = await redis_connector.get_world_user_data(world_id=world_id, user_id=user.user_id)
        if not world_user:

            # gives the guest the default role for that world
            world_default_role = crud.crud_role.get_world_default(db=db, world_id=world_id)
            world_user = await redis_connector.join_new_guest_user(world_id=world_id,
                                                                   user_id=user.user_id, role=world_default_role)

        # adds the world map to the data from the world_user
        world_user = schemas.World_UserWithRoleAndMap(**{**world_user.dict(), **{'map': world_obj.world_map}})

    return world_user


@router.put("/{world_id}", response_model=schemas.WorldMapInDB)
async def update_world(
        world_id: int,
        world_in: schemas.WorldUpdate,
        db: Session = Depends(deps.get_db),
        user: Optional[models.User] = Depends(deps.get_current_user)
) -> Any:
    """
    Updates a  specific World's Information
    """
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)
    # first checking if this user can edit the world(creator only)
    world_obj, message = crud.crud_world.is_editable_to_user(db=db, world_id=world_id, user_id=user.user_id)
    if not world_obj:
        raise HTTPException(
            status_code=400,
            detail=message,
        )
    # afterwards update data and clear cache
    world_obj_updated, message = await crud.crud_world.update(db=db, db_obj=world_obj, obj_in=world_in)
    if not world_obj_updated:
        raise HTTPException(
            status_code=400,
            detail=message,
        )
    return world_obj_updated


@router.put("/{world_id}/users",
            response_model=Union[schemas.World_UserInDB, schemas.World_UserWithRoleInDB])
async def update_world_user_info(
        world_id: int,
        user_data: schemas.World_UserUpdate,
        db: Session = Depends(deps.get_db),
        user: Optional[models.User] = Depends(deps.get_current_user_authorizer(required=False))
) -> Any:
    """
    Update User info for a given world: username and avatar name usually
    """
    # registered user
    if not is_guest_user(user):
        world_user_obj = crud.crud_world_user.get_user_joined(db, world_id, user.user_id)
        if not world_user_obj:
            raise HTTPException(status_code=400, detail=strings.USER_NOT_IN_WORLD)

        # no need to return error, override user_id
        user_data.user_id = user.user_id
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
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    obj, message = crud.crud_world.create(db=db, obj_in=world_in, user=user)
    if not obj:
        raise HTTPException(
            status_code=400,
            detail=message
        )

    return obj


@router.get("/", response_model=List[schemas.WorldInDB])
def search_world(
        search: Optional[str] = "",
        tags: Optional[List[str]] = Query(None),  # required when passing a list as parameter
        joined: Optional[bool] = False,
        page: Optional[int] = 1,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:
    if not is_guest_user(user):
        list_world_objs = crud.crud_world.filter(
            db=db, search=search, tags=tags, joined=joined, page=page, user_id=user.user_id
        )
    else:
        # guest cannot access visited worlds
        list_world_objs = crud.crud_world.filter(db=db, search=search, tags=tags, is_guest=True, page=page)
    return list_world_objs


@router.delete("/{world_id}", response_model=schemas.WorldInDB)
async def delete_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Optional[models.User] = Depends(deps.get_current_user),
) -> Any:
    """
    Deletes a world given an world_id, if the request is made by its creator
    """
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    world_obj, message = await crud.crud_world.remove(db=db, world_id=world_id, user_id=user.user_id)
    if not world_obj:
        raise HTTPException(
            status_code=400,
            detail=message
        )
    return world_obj
