from typing import Union
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.api import dependencies as deps
from app.core import strings
from app.utils import is_guest_user

router = APIRouter()


@router.get("/", response_model=schemas.GlobalStatistics)
async def get_platform_statistics(
    db: Session = Depends(deps.get_db),
    user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    """
    Returns the global Statistics of the platform
    """
    if is_guest_user(user) or not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    return await crud.crud_statistics.get_platform_statistics(db=db)


@router.get("/worlds/{world_id}", response_model=schemas.WorldStatistics)
async def get_world_statistics(
    world_id: int,
    db: Session = Depends(deps.get_db),
    user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    # only the admins and creators of the world can access the world statistics
    if is_guest_user(user) or \
            (not user.is_superuser and crud.crud_world.get_creator(db=db, world_id=world_id).user_id != user.user_id):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    return await crud.crud_statistics.get_world_statistics(db=db, world_id=world_id)


@router.get("/charts")
def get_platform_charts(
        start_date: date,
        end_date: date = date.today(),
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    if is_guest_user(user) or not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    return crud.crud_statistics.get_online_users_overtime(db=db, end_date=end_date, start_date=start_date)
