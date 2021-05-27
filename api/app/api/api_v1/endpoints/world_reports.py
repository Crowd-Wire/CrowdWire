from typing import Union, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import dependencies as deps
from app.core import strings
from app.utils import is_guest_user
from app.crud import crud_report_world
from app.schemas import ReportWorldCreate, ReportWorldInDB, ReportWorldUpdate


router = APIRouter()


@router.post("/", response_model=ReportWorldInDB)
async def create_world_report(
        world_id: int,
        report: ReportWorldCreate,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
) -> Any:

    report.reported = world_id
    report.timestamp = datetime.now()
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    report, msg = crud_report_world.create(db=db, obj_in=report, request_user=user)
    if not report:
        raise HTTPException(status_code=400, detail=msg)

    return report


@router.delete("/", response_model=ReportWorldInDB)
async def delete_world_report(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
) -> Any:

    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    report, msg = crud_report_world.remove(db=db, world_id=world_id, user_id=user.user_id)
    if not report:
        raise HTTPException(status_code=400, detail=msg)
    return report


@router.put("/", response_model=ReportWorldInDB)
async def update_world_report(
    world_id: int,
    world_report: ReportWorldUpdate,
    db: Session = Depends(deps.get_db),
    user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
):

    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    if not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    report, msg = crud_report_world.update(db=db, world_id=world_id, obj=world_report)
    if report is None:
        raise HTTPException(status_code=403, detail=msg)
    return report
