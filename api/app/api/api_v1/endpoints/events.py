from typing import Union

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import dependencies as deps
from app.core import strings
from app.utils import is_guest_user

router = APIRouter()


@router.get("/")
def get_world_events(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
):
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)
    return None
