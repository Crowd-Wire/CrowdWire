from typing import Union, List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import dependencies as deps
from app import schemas, models
from app.core import strings
from app.crud import crud_user, crud_report_user
from app.utils import is_guest_user
from app.schemas import ReportUserInDB, ReportUserCreate

router = APIRouter()


# TODO: Endpoint to get all/specific user(s), idk
@router.get("/me", response_model=schemas.UserInDB)
async def user_in_request(
        current_user: models.User = Depends(deps.get_current_user)
):
    """
        Returns Registered User Account Information
    """
    return current_user


@router.put("/{user_id}", response_model=schemas.UserInDB)
async def edit_user(
        user_id: Union[int],
        update_user: schemas.UserUpdate,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)
    user_obj, msg = crud_user.can_update(db=db, request_user=user, id=user_id)
    if not user_obj:
        raise HTTPException(status_code=400, detail=msg)
    updated_user_obj = crud_user.update(db=db, db_obj=user_obj, obj_in=update_user, request_user=user)
    return updated_user_obj

@router.get("/{id}/reports-sent", response_model=List[ReportUserInDB])
async def get_all_user_reports_sent(
        user_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:

    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    reports, msg = crud_report_user.get_all_user_reports_sent(db=db, request_user=user, user_id=user_id)

    return reports

@router.post("/{id}/reports-sent", response_model=ReportUserInDB)
async def report_user(
        report: ReportUserCreate,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:

    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    report, msg = crud_report_user.create(db=db, report=report, user_id=user.user_id)
    if not report:
        raise HTTPException(status_code=400, detail=msg)

    return report
