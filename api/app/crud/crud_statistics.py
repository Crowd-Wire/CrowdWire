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

    def get_users_registers_overtime(self, db: Session):
        """
        Retrieves the number of registers over the past the week
        """

        users_data = {}

        temp_date = datetime.combine(date.today(), datetime.min.time())
        for i in range(7):
            start_date = temp_date - timedelta(days=i)
            end_date = temp_date - timedelta(days=i - 1)
            users = db.query(func.count(User.user_id)).filter(User.register_date.between(start_date, end_date)).scalar()
            users_data[str(start_date)] = users

        return users_data

    def get_user_join_world_overtime(self, db: Session, world_id: int):

        data = {}
        temp_date = datetime.combine(date.today(), datetime.min.time())
        for i in range(7):
            start_date = temp_date - timedelta(days=i)
            end_date = temp_date - timedelta(days=i - 1)
            users = db.query(World_User).filter(World_User.world_id == world_id,
                                                World_User.join_date.between(start_date, end_date)) \
                .with_entities(func.count()).scalar()
            data[str(start_date)] = users

        return data

    def get_online_users_overtime(self, db: Session, start_date: datetime, end_date: datetime):

        data = []
        # temp_date = datetime.combine(date.today(), datetime.min.time())
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
