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
from pydantic import UUID4
from app.core import consts

router = APIRouter()


@router.get("/{world_id}", response_model=schemas.WorldInDBWithUserPermissions)
async def get_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
) -> Any:
    if not is_guest_user(user):
        db_world, message = await crud.crud_world.get_world_with_user_permissions(
            db=db, world_id=world_id, user_id=user.user_id)
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


@router.post("/invite/{invite_token}", response_model=schemas.World_UserWithRoleAndMap)
async def join_world_by_link(
        invite_token: str = None,
        *,
        db: Session = Depends(deps.get_db),
        result=Depends(deps.get_current_user_for_invite)
):
    user, world_obj = result
    # check whether the maximum number of users has been passed
    world_obj, msg = await crud.crud_world.update_online_users(world_obj, 1)
    if not world_obj:
        raise HTTPException(status_code=400, detail=msg)
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
        world_default_role = crud.crud_role.get_world_default(db=db, world_id=world_obj.world_id)
        world_user = await redis_connector.join_new_guest_user(world_id=world_obj.world_id, user_id=user.user_id,
                                                               role=world_default_role)
        world_user = schemas.World_UserWithRoleAndMap(**{**world_user.dict(), **{'map': world_obj.world_map}})
    return world_user


@router.post("/{world_id}/users", response_model=schemas.World_UserWithRoleAndMap)
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

        # checks if the world is available for the user
        world_obj, msg = await crud.crud_world.get_available(db=db, world_id=world_id, user_id=user.user_id)
        if not world_obj:
            raise HTTPException(status_code=400, detail=msg)

        # check whether the maximum number of users has been passed
        world_obj, msg = await crud.crud_world.update_online_users(world_obj, 1)
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

        # check whether the maximum number of users has been passed
        world_obj, msg = await crud.crud_world.update_online_users(world_obj, 1)
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

    # admins can also change the status of the world whenever they want
    if not world_obj and not user.is_superuser:
        raise HTTPException(
            status_code=400,
            detail=message,
        )

    # creator cannot change the world if it is banned
    if world_obj.status == consts.WORLD_BANNED_STATUS and not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    # afterwards update data and clear cache
    world_obj_updated, message = await crud.crud_world.update(db=db, db_obj=world_obj, obj_in=world_in)
    if not world_obj_updated:
        raise HTTPException(
            status_code=400,
            detail=message,
        )
    return world_obj_updated


@router.get("/{world_id}/users/{user_id}", response_model=schemas.World_UserInDB)
async def get_world_user_info(
        world_id: int,
        user_id: Union[int, UUID4],
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
):
    """
    Returns the user info of a user in a given world.
    """
    is_guest = type(user_id) != int

    if is_guest_user(user):
        raise HTTPException(status_code=NotImplemented)

    if user.user_id != user_id:
        raise HTTPException(status_code=400, detail=strings.ACCESS_FORBIDDEN)

    if is_guest:
        world_user = await redis_connector.get_world_user_data(world_id=world_id, user_id=user_id)
        if not world_user:
            return {'world_id': world_id, 'user_id': user.user_id, 'username': None, 'avatar': None, 'role': None}
    else:
        world_user = crud.crud_world_user.get_user_joined(db=db, world_id=world_id, user_id=user.user_id)
        if not world_user:
            return {'world_id': world_id, 'user_id': user.user_id, 'username': None, 'avatar': None, 'role': None}
    return world_user


@router.put("/{world_id}/users/{user_id}",
            response_model=schemas.World_UserInDB)
async def update_world_user_info(
        world_id: int,
        user_id: Union[int, UUID4],
        user_data: schemas.World_UserUpdate,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:
    """
    Update User info for a given world: username and avatar name usually
    """

    # if the user_id is not an int then it is a guest
    is_guest = type(user_id) != int

    # guests can only change its info
    if is_guest_user(user) and user_id != user.user_id:
        raise HTTPException(status_code=400, detail=strings.ACCESS_FORBIDDEN)

    # guest users cannot be reported
    if is_guest and user_data.status:
        raise HTTPException(status_code=400, detail=strings.USER_IS_NOT_BANNABLE)

    # only guests can change their info
    if is_guest and user_id != user.user_id:
        raise HTTPException(status_code=400, detail=strings.CHANGE_USER_INFO_FORBIDDEN)

    world_user, msg = await crud.crud_world_user.update_world_user_info(
        db=db, world_id=world_id, request_user=user, user_to_change=user_id, is_guest=is_guest,
        world_user_data=user_data
    )
    if not world_user:
        raise HTTPException(status_code=400, detail=msg)
    return world_user


@router.post("/", response_model=schemas.WorldMapInDB)
async def create_world(
        *,
        world_in: schemas.WorldCreate,
        db: Session = Depends(deps.get_db),
        user: models.User = Depends(deps.get_current_user_authorizer(required=True))
) -> Any:
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    world_in.creator = user
    obj, message = await crud.crud_world.create(db=db, obj_in=world_in, user=user)
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
        visibility: Optional[str] = None,
        banned: Optional[bool] = False,
        deleted: Optional[bool] = False,
        normal: Optional[bool] = False,
        creator: Optional[int] = None,
        order_by: Optional[str] = "timestamp",
        order: Optional[str] = "desc",
        page: Optional[int] = 1,
        limit: Optional[int] = 10,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:

    if not is_guest_user(user):
        if user.is_superuser:
            # admins
            list_world_objs, msg = crud.crud_world.filter(
                db=db, search=search, tags=tags, is_superuser=True, page=page, limit=limit, creator=creator,
                visibility=visibility, banned=banned, deleted=deleted, normal=normal, order_by=order_by, order=order)
        else:
            # registered users
            list_world_objs, msg = crud.crud_world.filter(
                db=db, search=search, tags=tags, visibility=visibility, page=page, requester_id=user.user_id,
                limit=limit, order_by=order_by, order=order)
    else:
        # guests
        list_world_objs, msg = crud.crud_world.filter(
            db=db, search=search, tags=tags, is_guest=True, page=page, limit=limit, visibility=visibility,
            order_by=order_by, order=order)

    if list_world_objs is None:
        raise HTTPException(status_code=400, detail=msg)
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


@router.get("/{world_id}/users", response_model=List[schemas.World_UserInDB])
async def get_all_users_from_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Optional[models.User] = Depends(deps.get_current_user),
) -> Any:
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    role, msg = await crud.crud_role.can_access_world_roles(db=db, world_id=world_id, user_id=user.user_id)
    if role is None:
        raise HTTPException(status_code=400, detail=msg)

    return crud.crud_world_user.get_all_registered_users(db=db, world_id=world_id)


@router.get("/reports/", response_model=List[schemas.ReportWorldInDBWithEmail])
async def get_worlds_reports(
        world: Optional[int] = None,
        reporter: Optional[int] = None,
        reviewed: Optional[bool] = False,
        banned: Optional[bool] = False,
        order_by: Optional[str] = "timestamp",
        order: Optional[str] = "desc",
        page: Optional[int] = 1,
        limit: Optional[int] = 10,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    if not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.WORLD_REPORT_ACCESS_FORBIDDEN)

    reports, msg = crud.crud_report_world.get_all_world_reports(
        db=db, page=page, limit=limit, world=world, user=reporter,
        reviewed=reviewed, banned=banned, order_by=order_by, order=order)

    return reports
