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


crud_report_world = CRUDReport_World(Report_World)