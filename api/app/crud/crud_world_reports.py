from typing import Optional, Tuple, List

from sqlalchemy.orm import Session
from .base import CRUDBase
from app.models import World, User, Report_World
from app.core import strings
from app.schemas import ReportWorldCreate, ReportWorldInDBWithEmail
from .crud_world_users import crud_world_user


class CRUDReport_World(CRUDBase[Report_World, ReportWorldCreate, None]):

    def get_all_world_reports(
            self, db: Session, page: int, limit: int, world_id: Optional[int] = None
    ) -> List[ReportWorldInDBWithEmail]:
        """
        Returns every report for that world.
        """
        # TODO: change this value later
        page_size = 10

        # this query gets all reports for a world and gets the email and name the of the world
        reports = db.query(
            Report_World.reported,
            Report_World.reporter,
            Report_World.comment,
            Report_World.timestamp,
            World.name.label("world_name"),
            User.email.label("reporter_email")
        ).filter(
            Report_World.reporter == User.user_id
        )

        # if world_id is not provided returns reports from all worlds
        if world_id:
            reports = reports.filter(
                Report_World.reported == world_id,
                World.world_id == world_id,
            )
        reports = reports.offset(page_size * (page - 1)).limit(page_size).all()

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

        report = super().create(db=db, obj_in=obj_in)
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
