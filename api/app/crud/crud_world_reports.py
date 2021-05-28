from typing import Optional, Tuple, List
from sqlalchemy import desc, asc
from sqlalchemy.orm import Session
from .base import CRUDBase
from app.models import World, User, Report_World
from app.core import strings, consts
from app.schemas import ReportWorldCreate, ReportWorldInDBWithEmail, ReportWorldUpdate, ReportWorldInDB
from .crud_world_users import crud_world_user
from datetime import datetime


class CRUDReport_World(CRUDBase[Report_World, ReportWorldCreate, ReportWorldUpdate]):

    def get_all_world_reports(
            self, db: Session,
            page: int, limit: int,
            banned: bool, reviewed: bool,
            order_by: str, order: str,
            world: Optional[int] = None,
            user: Optional[int] = None
    ) -> List[ReportWorldInDBWithEmail]:
        """
        Returns every report for that world.
        """

        # this query gets all reports for a world and gets the email and name the of the world
        query = db.query(
            Report_World.reported,
            Report_World.reporter,
            Report_World.comment,
            Report_World.timestamp,
            Report_World.reviewed,
            World.name.label("world_name"),
            User.email.label("reporter_email"),
            World.status.label("banned")
        ).filter(
            Report_World.reporter == User.user_id,
            Report_World.reported == World.world_id,
            World.status != consts.WORLD_DELETED_STATUS
        )

        # shows only the worlds that are not banned or deleted
        if not banned:
            query = query.filter(World.status == consts.WORLD_NORMAL_STATUS)
        else:
            query = query.filter(World.status == consts.WORLD_BANNED_STATUS)

        # shows the reports that have been reviewed as well
        if reviewed:
            query = query.filter(Report_World.reviewed.is_(True))
        else:
            query = query.filter(Report_World.reviewed.is_(False))

        # if the world is provided it will search for a world with that name
        if world:
            query = query.filter(World.world_id == world)

        # if the user is provided it will search for the reports made by a user with that email
        if user:
            query = query.filter(User.user_id == user)

        # assigns a function to variable so that it can be called later
        if order == 'desc':
            ord = desc
        else:
            ord = asc

        # add more later
        if order_by == 'timestamp':
            query = query.order_by(ord(Report_World.timestamp))

        reports = query.offset(limit * (page - 1)).limit(limit).all()

        # the results are not inside a dict so it is hard to conver to json
        return [r._asdict() for r in reports], ""

    def get_world_report_for_user(self, db: Session, world_id: int, user_id: int):
        """
        Checks if a user has reported a given world.
        """
        report = db.query(Report_World)\
            .filter(Report_World.reported == world_id, Report_World.reporter == user_id).first()

        if not report:
            return None, strings.REPORT_NOT_FOUND_FOR_WORLD_BY_USER
        return report, ""

    def create(
            self, db: Session, obj_in: ReportWorldCreate, *args, **kwargs
    ) -> Tuple[Optional[Report_World], str]:
        """
        Checks if the world was already reported by user and if not creates the report.
        """

        request_user = kwargs.get('request_user')
        if not request_user or (request_user and not isinstance(request_user, User)):
            return None, strings.USER_NOT_PASSED

        world_user = crud_world_user.get_user_joined(db=db, user_id=request_user.user_id, world_id=obj_in.reported)
        if not world_user:
            return None, strings.USER_CANNOT_REPORT_WORLD

        # checks if the user has already reported this world
        report, _ = self.get_world_report_for_user(db=db, world_id=obj_in.reported, user_id=request_user.user_id)
        if report:
            return None, strings.WORLD_ALREADY_REPORTED_BY_USER

        obj_in.reporter = request_user.user_id
        obj_in.timestamp = datetime.now()

        report = super().create(db=db, obj_in=obj_in)
        return report, ""

    def update(self, db: Session, world_id: int, obj: ReportWorldUpdate) -> ReportWorldInDB:

        report, msg = self.get_world_report_for_user(db=db, world_id=world_id, user_id=obj.reporter)
        if report is None:
            return None, strings.WORLD_NOT_REPORTED_BY_USER

        if report.reviewed == obj.reviewed:
            return None, strings.NO_EFFECT_REQUEST

        report = super().update(db=db, db_obj=report, obj_in=obj)
        if not report:
            return None, strings.UPDATE_FAIL
        return report, ""

    def remove(self, db: Session, world_id: int, user_id: int) -> Tuple[Optional[Report_World], str]:
        """
        Deletes the report made by a user to a world.
        """
        report, _ = self.get_world_report_for_user(db=db, world_id=world_id, user_id=user_id)
        if not report:
            return None, strings.WORLD_NOT_REPORTED_BY_USER

        db.delete(report)
        db.commit()
        return report, ""


crud_report_world = CRUDReport_World(Report_World)
