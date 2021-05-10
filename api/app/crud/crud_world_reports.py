from typing import Optional, Tuple, List

from sqlalchemy.orm import Session
from loguru import logger
from .crud_roles import crud_role
from .base import CRUDBase
from app.redis.connection import redis_connector
from app.models import World_User, World, User, Role, Report_World
from app.core import strings
from app.schemas import ReportWorldBase, ReportWorldCreate, ReportWorldInDBWithUsername

class CRUDReport_World(CRUDBase[Report_World, ReportWorldCreate, None]):

    async def get_all_world_reports(
            self, db: Session, world_id: int, page: int, limit: int
    ) -> List[ReportWorldInDBWithUsername]:
        """
        Returns every report for that world.
        """

        reports = db.query(Report_World, World, World_User)\
            .join(Report_World.reported == World.world_id)\
            .join(Report_World.reporter == World_User.user_id)\
            .filter(Report_World.reported == world_id).all()

        logger.debug(reports.__dict__)

        return reports

    async def get_world_report_for_user(self, db: Session, world_id: int, user_id: int):
        """
        Checks if a user has reported a given world.
        """
        report = db.query(Report_World)\
            .filter(Report_World.reported == world_id, Report_World.reporter == user_id).first()

        if not report:
            return None, strings.REPORT_NOT_FOUND_FOR_WORLD_BY_USER
        return report, ""

    async def create(
            self, db: Session, obj_in: ReportWorldCreate, *args, **kwargs
    ) -> Tuple[Optional[Report_World], str]:
        """
        Checks if the world was already reported by user and if not creates the report.
        """

        request_user = kwargs.get('request_user')
        if not request_user or (request_user and not isinstance(request_user, User)):
            return None, strings.USER_NOT_PASSED

        report, _ = self.get_world_report_for_user(db=db, world_id=obj_in.reporter, user_id=request_user.user_id)
        if report:
            return None, strings.WORLD_ALREADY_REPORTED_BY_USER

        obj_in.reporter = request_user.user_id

        report = super().create(db=db, obj_in=obj_in)
        return report, ""




crud_report_world = CRUDReport_World(Report_World)