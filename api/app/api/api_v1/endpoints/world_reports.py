from typing import Union, Optional, List, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import dependencies as deps
from app.core import strings
from app.utils import is_guest_user
from app.crud import crud_report_world
from app.schemas import ReportWorldCreate, ReportWorldInDBWithEmail

router = APIRouter()


@router.get("/", response_model=List[ReportWorldInDBWithEmail])
async def get_all_reports_from_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
        page: Optional[int] = 1,
        limit: Optional[int] = 10
) -> Any:

    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    if not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.WORLD_REPORT_ACCESS_FORBIDDEN)

    reports, msg = await crud_report_world.get_all_world_reports(db=db, world_id=1, page=page, limit=limit)
    return reports


@router.post("/", response_model=ReportWorldCreate)
async def create_world_report(
        report: ReportWorldCreate,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
) -> Any:

    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    report, msg = await crud_report_world.create(db=db, obj_in=report, request_user=user)
    if not report:
        raise HTTPException(status_code=400, detail=msg)

    return report
