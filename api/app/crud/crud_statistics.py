import datetime
from typing import Optional, Tuple, List

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.redis import redis_connector
from app.core import strings, consts
from app import crud, schemas
from app.models import World, User, Report_User, Report_World, World_User

"""
Statistics dont follow the same CRUD Rules from the Base Class
since they cannot be created/updated/deleted through the REST API
"""


class CRUDStatistics:
    """
    Class contains the crud operations for the statistics
    """

    def get_platform_statistics(self, db: Session) -> schemas.GlobalStatistics:
        """
        Retrieves the information for the platform statistics
        """
        worlds = db.query(func.count(World.world_id)).scalar()
        users = db.query(func.count(User.user_id)).filter(User.status == consts.USER_NORMAL_STATUS).scalar()

        user_reports = db.query(Report_User).filter(
            Report_User.reviewed.is_(False),
        ).with_entities(func.count()).scalar()

        world_reports = db.query(Report_World).join(World).filter(
            Report_World.reviewed.is_(False),
            Report_World.reported == World.world_id,
            World.status == consts.WORLD_NORMAL_STATUS
        ).with_entities(func.count()).scalar()

        return schemas.GlobalStatistics(
            **{'users': users, 'worlds': worlds, 'user_reports': user_reports, 'world_reports': world_reports})

    async def get_world_statistics(self, db: Session, world_id: int) -> schemas.WorldStatistics:
        """
        Retrieves the statistics related to a world
        """

        total_users = db.query(World_User).filter(World_User.world_id == world_id).with_entities(func.count()).scalar()
        online_users = await redis_connector.get_online_users(world_id=world_id)
        reports = db.query(Report_World).filter(Report_World.reported == world_id).with_entities(func.count()).scalar()
        total_n_joins = db.query(func.sum(World_User.n_joins)).filter(World_User.world_id == world_id).scalar()

        return schemas.WorldStatistics(
            **{'total_users': total_users, 'online_users': online_users, 'reports': reports,
               'total_n_joins': total_n_joins, 'world_id': world_id}
        )

crud_statistics = CRUDStatistics()
