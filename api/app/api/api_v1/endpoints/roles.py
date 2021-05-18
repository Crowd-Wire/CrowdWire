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

@router.post("/{role_id}/users")
async def assign_role_to_user(
        role_id: int,
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    role, msg = crud_role.can_access_world_roles(db=db, world_id=world_id, user_id=user.user_id)
    if role is None:
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    if not is_guest_user(user):
        # updates the user role in the database. In case it doesnt exists, it cannot exist in cache
        db_role, msg = crud_world_user.update_user_role(db=db, world_id=world_id, user_id=user.user_id, role_id=role_id)
        if db_role is None:
            raise HTTPException(status_code=400, detail=strings.USER_NOT_IN_WORLD)

    # updates the cache for the user and guest
    world_user_data = await redis_connector.get_world_user_data()
    if world_user_data is None:
        # if there is no information about the guest in cache then it has not joined this world
        if is_guest_user(user):
            raise HTTPException(status_code=400, detail=strings.USER_NOT_IN_WORLD)
    else:
        new_role = crud_role.get(db=db, role_id=role_id)
        if world_user_data.role.role_id == role_id:
            # if the role is not going to change, it is better to return it already
            return world_user_data

        await self.save_world_user_data(
            world_id=world_id,
            user_id=user_id,
            data={'role': new_role}
        )
