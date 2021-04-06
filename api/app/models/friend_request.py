from sqlalchemy import Column, Integer, DateTime, ForeignKey, Table

from app.db.base_class import Base
from app.core.config import settings


friend_request = Table(
    'friend_request',
    Base.metadata,
    Column('sender', Integer, ForeignKey(settings.SCHEMA_NAME+'.user.user_id'), primary_key=True),
    Column('receiver', Integer, ForeignKey(settings.SCHEMA_NAME+'.user.user_id'), primary_key=True),
    Column('invite_date', DateTime),
    schema=settings.SCHEMA_NAME
)
