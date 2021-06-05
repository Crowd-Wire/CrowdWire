from datetime import datetime, timedelta, date

from app.core.consts import WebsocketProtocol as protocol
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from app.redis import redis_connector
from app.core import consts
from app import schemas
from app.models import World, User, Report_User, Report_World, World_User, Event

"""
Statistics dont follow the same CRUD Rules from the Base Class
since they cannot be created/updated/deleted through the REST API
"""


class CRUDStatistics:
    """
    Class contains the crud operations for the statistics
    """

    async def get_platform_statistics(self, db: Session) -> schemas.GlobalStatistics:
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

        online_users = await redis_connector.get_online_users_platform()

        return schemas.GlobalStatistics(
            **{'users': users,
               'worlds': worlds,
               'user_reports': user_reports,
               'world_reports': world_reports,
               'online_users': online_users
               })

    async def get_world_statistics(
            self, db: Session, world_id: int, start_date: datetime = None, end_date: datetime = None
    ) -> schemas.WorldStatistics:
        """
        Retrieves the statistics related to a world
        """

        total_users = db.query(World_User).filter(World_User.world_id == world_id).with_entities(func.count()).scalar()
        online_users = await redis_connector.get_online_users(world_id=world_id)
        reports = db.query(Report_World).filter(Report_World.reported == world_id).with_entities(func.count()).scalar()
        total_n_joins = db.query(func.sum(World_User.n_joins)).filter(World_User.world_id == world_id).scalar()

        user_joined_overtime = []
        if start_date is not None and end_date is not None:
            user_joined_overtime = self.get_user_join_world_overtime(
                db=db, start_date=start_date, end_date=end_date, world_id=world_id)

        return schemas.WorldStatistics(
            **{'total_users': total_users, 'online_users': online_users, 'reports': reports,
               'total_n_joins': total_n_joins, 'world_id': world_id, 'user_joined_overtime': user_joined_overtime}
        )

    def get_users_registers_overtime(self, db: Session, start_date: datetime, end_date: datetime):
        """
        Retrieves the number of registers over the past the week
        """
        data = []

        n_hours = int((end_date - start_date).total_seconds() // 3600)
        for i in range(n_hours + 1):
            temp_start = start_date + timedelta(hours=i)
            temp_end = start_date + timedelta(hours=i + 1)
            users = db.query(func.count(User.user_id)).filter(User.register_date.between(temp_start, temp_end)).scalar()
            data.append({str(temp_start): users})

        return data

    def get_user_join_world_overtime(self, db: Session, world_id: int, start_date: datetime, end_date: datetime):
        """
        Retrieves the number of users that joined the world
        """
        data = []

        n_hours = int((end_date - start_date).total_seconds() // 3600)
        for i in range(n_hours + 1):
            temp_start = start_date + timedelta(hours=i)
            temp_end = start_date + timedelta(hours=i + 1)
            users = db.query(func.count(distinct(Event.user_id))).filter(
                Event.event_type == protocol.JOIN_PLAYER,
                Event.timestamp.between(temp_start, temp_end),
                Event.world_id == world_id
            ).scalar()
            data.append({str(temp_start): users})

        return data

    def get_online_users_overtime(self, db: Session, start_date: datetime, end_date: datetime):
        """
        Retrieves the number of users that joined
        """
        data = []

        n_hours = int((end_date - start_date).total_seconds() // 3600)
        for i in range(n_hours + 1):
            temp_start = start_date + timedelta(hours=i)
            temp_end = start_date + timedelta(hours=i + 1)
            users = db.query(func.count(distinct(Event.user_id))).filter(
                Event.event_type == protocol.JOIN_PLAYER,
                Event.timestamp.between(temp_start, temp_end)).scalar()
            data.append({str(temp_start): users})

        return data


crud_statistics = CRUDStatistics()
