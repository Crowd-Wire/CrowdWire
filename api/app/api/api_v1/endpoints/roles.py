from typing import Union, Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import dependencies as deps
from app.core import strings
from app.utils import is_guest_user
from app.crud import crud_role

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
    role, msg = await crud_role.can_acess_world_roles(db=db, world_id=world_id, user_id=user.user_id)
    if not role:
        raise HTTPException(status_code=400, detail=msg)
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

    role, msg = await crud_role.can_acess_world_roles(db=db, world_id=world_id, user_id=user.user_id)
    if not role:
        raise HTTPException(status_code=400, detail=msg)
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

    role, msg = await crud_role.can_acess_world_roles(db=db, world_id=world_id, user_id=user.user_id)
    if not role:
        raise HTTPException(status_code=400, detail=msg)

    role_obj_deleted, msg = await crud_role.remove(db=db, role_id=role_id, world_id=world_id, user_id=user.user_id)
    if not role_obj_deleted:
        raise HTTPException(status_code=400, detail=msg)
    return role_obj_deleted
