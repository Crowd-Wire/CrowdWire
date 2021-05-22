from typing import Union, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas, crud
from app.api import dependencies as deps
from app.core import strings
from app.core.consts import WebsocketProtocol as protocol
from app.utils import is_guest_user
from app import crud

router = APIRouter()


@router.get("/", response_model=List[schemas.EventInDB])
def get_world_events(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
        event_type: Optional[str] = None,
        user_id: Optional[int] = None,
        order_desc: bool = True,
        page: int = 1,
        limit: int = 2,
):
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)
    crud.crud_event.create(db=db,
                           user_id=user.user_id,
                           world_id=world_id,
                           event_type=protocol.LEAVE_PLAYER)
    events = crud.crud_event.filter(
        db=db, world_id=world_id,
        user_id=user_id,
        page_num=page,
        limit=limit,
        event_type=event_type,
        order_desc=order_desc)
    return events
