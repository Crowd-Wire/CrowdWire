from sqlalchemy import Column, Integer, ForeignKey, Table, DateTime

from app.db.base_class import Base
from app.core.config import settings

friends = Table(
    'friend',
    Base.metadata,
    Column('user1_id', Integer, ForeignKey(settings.SCHEMA_NAME+'.user.user_id'), primary_key=True),
    Column('user2_id', Integer, ForeignKey(settings.SCHEMA_NAME+'.user.user_id'), primary_key=True),
    Column('accept_date', DateTime, nullable=False),
    schema=settings.SCHEMA_NAME
)
