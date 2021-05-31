from typing import Union, List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import dependencies as deps
from app import schemas, models
from app.core import strings
from app.crud import crud_user, crud_report_user
from app.utils import is_guest_user
from loguru import logger
from app.schemas import ReportUserInDB, ReportUserCreate, ReportUserInDBDetailed, ReportUserUpdate

router = APIRouter()


# TODO: Endpoint to get all/specific user(s), idk
@router.get("/me", response_model=schemas.UserInDB)
async def user_in_request(
        current_user: models.User = Depends(deps.get_current_user)
):
    """
        Returns Registered User Account Information
    """
    logger.info("user_in_request")
    return current_user


@router.get("/{user_id}/", response_model=schemas.UserInDB)
async def get_user_info(
        user_id: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
) -> Any:
    """
    Gets the user info, only admins can access this endpoint
    """
    if is_guest_user(user) or not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    user_info = crud_user.get(db=db, id=user_id)
    if not user_info:
        raise HTTPException(status_code=400, detail="User not found")
    return user_info


@router.get("/", response_model=List[schemas.UserInDB])
async def filter_users(
        email: str = None,
        banned: bool = False,
        normal: bool = True,
        order_by: str = "register_date",
        order: str = "desc",
        page: int = 1,
        limit: int = 10,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    """
    Filters the users based on multiple parameters. This endpoint can only be accessed by an admin.
    """

    if is_guest_user(user) or not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    users, msg = crud_user.filter(
        db=db, email=email, banned=banned, normal=normal, order_by=order_by, order=order, page=page, limit=limit)
    if users is None:
        raise HTTPException(status_code=400, detail=msg)

    return users


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

    updated_user_obj, msg = crud_user.update(db=db, db_obj=user_obj, obj_in=update_user, request_user=user)
    if not updated_user_obj:
        raise HTTPException(status_code=400, detail=msg)
    return updated_user_obj


@router.put("/password-update/", response_model=schemas.UserInDB)
async def update_user_password(
        update_password: schemas.UserUpdatePassword,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user),
):
    logger.debug("entering..")
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)
    update_password_obj, msg = crud_user.update_password(db=db, db_obj=user, obj_in=update_password)
    if not update_password_obj:
        raise HTTPException(status_code=400, detail=msg)
    return update_password_obj


@router.get("/{id}/reports-sent", response_model=List[ReportUserInDB])
async def get_all_user_reports_sent(
        id: int,
        page: int = 1,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:
    """
    Gets all the reports made by a user. Can be accessed by that user or by an admin.
    """
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    reports, msg = crud_report_user.get_all_user_reports_sent(db=db, request_user=user, user_id=id, page=page)
    if reports is None:
        raise HTTPException(status_code=400, detail=msg)

    return reports


@router.post("/{id}/reports-received/", response_model=ReportUserInDB)
async def report_user(
        id: int,
        report: ReportUserCreate,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:
    """
    Creates a User Report.
    """
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    report, msg = crud_report_user.create(db=db, report=report, reporter_id=user.user_id, reported_id=id)
    if not report:
        raise HTTPException(status_code=400, detail=msg)

    return report


@router.get("/{id}/reports-received", response_model=List[ReportUserInDB])
async def get_all_user_reports_received(
        id: int,
        page: int = 1,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:
    """
    Gets all the reports received by a user. Can be accessed by an admin.
    """
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    reports, msg = crud_report_user.get_all_user_reports_received(db=db, user_id=id, request_user=user, page=page)
    if reports is None:
        raise HTTPException(status_code=400, detail=msg)

    return reports


@router.get("/{id}/reports-received/{world}", response_model=List[ReportUserInDB])
async def get_all_user_report_received_in_world(
        id: int,
        world: int,
        page: int = 1,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:
    """
    Gets all reports received by a user in a given world. Can be access by world mods and admins.
    """
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    reports, msg = await crud_report_user.get_all_user_reports_received_in_world(
        db=db, user_id=id, request_user=user, page=page, world_id=world)

    if reports is None:
        raise HTTPException(status_code=400, detail=msg)
    return reports


@router.delete("/{reporter}/reports-sent/{world}/{reported}", response_model=ReportUserInDB)
async def delete_report_to_user_in_world(
        reporter: int,
        reported: int,
        world: int,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:
    """
    Removes a report made to a user in a world.
    """
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    # checks for permissions and deletes the report
    report, msg = await crud_report_user.remove(
        db=db, request_user=user, reported=reported, reporter=reporter, world_id=world)

    if report is None:
        raise HTTPException(status_code=400, detail=msg)

    return report


@router.get("/reports/", response_model=List[ReportUserInDBDetailed])
async def filter_user_reports(
        world_id: int = None,
        reporter_id: int = None,
        reported_id: int = None,
        order_by: str = "timestamp",
        order: str = "desc",
        reviewed: bool = False,
        page: int = 1,
        limit: int = 10,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:
    """
    Filters user reports for the world mods and platform admins.
    """
    if is_guest_user(user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    reports, msg = await crud_report_user.filter(
        db=db, user=user, world_id=world_id, reporter_id=reporter_id, reported_id=reported_id, order_by=order_by,
        order=order, page=page, limit=limit, reviewed=reviewed
    )
    if reports is None:
        raise HTTPException(status_code=400, detail=msg)
    return reports


@router.put("/{reporter}/reports-sent/{world}/{reported}/", response_model=ReportUserInDB)
def update_user_report(
        reporter: int,
        reported: int,
        world: int,
        report: ReportUserUpdate,
        db: Session = Depends(deps.get_db),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_current_user)
) -> Any:
    # only admins can change a report
    if is_guest_user(user) or not user.is_superuser:
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)

    report, msg = crud_report_user.update(db=db, reported=reported, reporter=reporter, world=world, update=report)
    if report is None:
        raise HTTPException(status_code=400, detail=msg)
    return report
