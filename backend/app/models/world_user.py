from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String, DateTime, Table
from app.core.config import settings

world_user = Table('world_user', Base.metadata,
                   Column('user_id', Integer, ForeignKey(settings.SCHEMA_NAME + '.user.user_id'), primary_key=True,
                          index=True),
                   Column('world_id', Integer, ForeignKey(settings.SCHEMA_NAME + '.world.world_id'), primary_key=True,
                          index=True),
                   Column('role_name', String(30), ForeignKey(settings.SCHEMA_NAME + '.role.name'), nullable=False),
                   Column('avatar', String(50)),
                   Column('avatar', DateTime),
                   schema=settings.SCHEMA_NAME
                   )
