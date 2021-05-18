from typing import Union, Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import dependencies as deps
from app.core import strings
from app.utils import is_guest_user
from app.crud import crud_role, crud_world_user
from app.redis import redis_connector

router = APIRouter()


@router.get("/", response_model=List[schemas.RoleInDB])
async def get_all_world_roles(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
        page: Optional[int] = 1,
        limit: Optional[int] = 10
):
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)
    role, msg = await crud_role.can_access_world_roles(db=db, world_id=world_id, user_id=user.user_id)
    if not role:
        raise HTTPException(status_code=403, detail=msg)
    roles, msg = await crud_role.get_world_roles(db=db, world_id=1, page=page, limit=limit)
    return roles


@router.post("/", response_model=schemas.RoleInDB)
async def add_role_to_world(
        role: schemas.RoleCreate,
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)
    role.world_id = world_id
    role, msg = await crud_role.create(db=db, obj_in=role, request_user=user)
    if not role:
        raise HTTPException(status_code=400, detail=msg)
    return role


@router.put("/{role_id}")
async def edit_role_in_world(
        role_id: int,
        role_in: schemas.RoleUpdate,
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    role, msg = await crud_role.can_access_world_roles(db=db, world_id=world_id, user_id=user.user_id)
    if not role:
        raise HTTPException(status_code=403, detail=msg)
    role, msg = await crud_role.get_by_role_id_and_world_id(db=db, role_id=role_id, world_id=world_id)
    if not role:
        raise HTTPException(status_code=400, detail=msg)
    role_in.world_id = world_id
    role_obj_upd, _ = await crud_role.update(db=db, db_obj=role, obj_in=role_in)
    return role_obj_upd


@router.delete("/{role_id}", response_model=schemas.RoleInDB)
async def delete_role_in_world(
        role_id: int,
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    role, msg = await crud_role.can_access_world_roles(db=db, world_id=world_id, user_id=user.user_id)
    if not role:
        raise HTTPException(status_code=403, detail=msg)

    role_obj_deleted, msg = await crud_role.remove(db=db, role_id=role_id, world_id=world_id, user_id=user.user_id)
    if not role_obj_deleted:
        raise HTTPException(status_code=400, detail=msg)
    return role_obj_deleted


@router.post("/{role_id}/users", response_model=schemas.World_UserInDB)
async def assign_role_to_user(
        role_id: int,
        world_id: int,
        user_to_change: schemas.AnyUser,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    """
    For registered the users the role is changed in the database and in redis cache if it exists.
    For guests it is only changed in redis cache.
    """

    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    # verifies if the user and role exist and if the request user has permissions to change role
    new_role, msg = await crud_role.can_assign_new_role_to_user(
        db=db, role_id=role_id, world_id=world_id, request_user=user.user_id, user_to_change=user_to_change)
    if new_role is None:
        raise HTTPException(status_code=400, detail=msg)

    # updates the user role in the database. In case it doesnt exists, it cannot exist in cache
    if not user_to_change.is_guest_user:
        world_user, msg = crud_world_user.update_user_role(
            db=db, world_id=world_id, user_id=user_to_change.user_id, role_id=role_id)
        if world_user is None:
            raise HTTPException(status_code=400, detail=msg)

    # changes redis cache
    world_user_data, msg = await redis_connector.assign_role_to_user(
        user_id=user_to_change.user_id, is_guest=user_to_change.is_guest_user, world_id=world_id, role=new_role)
    # if there is nothing in cache, the guests are not in this world
    if world_user_data is None and user_to_change.is_guest_user:
        raise HTTPException(status_code=400, detail=msg)

    return world_user
