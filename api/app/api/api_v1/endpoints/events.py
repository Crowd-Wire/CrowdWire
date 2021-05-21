from typing import Union, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import dependencies as deps
from app.core import strings
from app.utils import is_guest_user
from app import crud

router = APIRouter()


@router.get("/", response_model=List[schemas.EventInDB])
def get_world_events(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
):
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)
    events, _ = crud.crud_event.get_all_by_world_id(db=db, world_id=world_id)
    return events
