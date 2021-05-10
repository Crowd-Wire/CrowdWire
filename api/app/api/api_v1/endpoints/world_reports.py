from typing import Union, Optional, List, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import dependencies as deps
from app.core import strings
from app.utils import is_guest_user
from app.crud import crud_role, crud_report_world

router = APIRouter()


router.get("/")
async def get_all_world_reports(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
        page: Optional[int] = 1,
        limit: Optional[int] = 10
) -> Any:

    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)
    role, msg = await crud_role.can_access_world_reports(db=db, world_id=world_id, user_id=user.user_id)
    if not role:
        raise HTTPException(status_code=403, detail=msg)

    reports, msg = await crud_report_world(db=db, world_id=1, page=page, limit=limit)
    return roles
