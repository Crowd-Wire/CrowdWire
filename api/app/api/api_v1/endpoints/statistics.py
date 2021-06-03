from typing import Union
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.api import dependencies as deps
from app.core import strings
from app.utils import is_guest_user

router = APIRouter()


@router.get("/", response_model=schemas.GlobalStatistics)
def get_platform_statistics(
    db: Session = Depends(deps.get_db),
    user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    """
    Returns the global Statistics of the platform
    """
    if is_guest_user(user) or not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    return crud.crud_statistics.get_platform_statistics(db=db)


@router.get("/worlds/{world_id}", response_model=schemas.WorldStatistics)
async def get_world_statistics(
    world_id: int,
    db: Session = Depends(deps.get_db),
    user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):

    # TODO: change this to allow world moderators to see this
    if is_guest_user(user) or not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    return await crud.crud_statistics.get_world_statistics(db=db, world_id=world_id)
