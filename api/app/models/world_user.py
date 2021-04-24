from sqlalchemy.orm import relationship

from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String, TIMESTAMP
from app.core.config import settings

"""
Many to Many between world and user. Keeps information about a user in a world.
"""


class World_User(Base):
    user_id = Column(
        Integer,
        ForeignKey(settings.SCHEMA_NAME + ".user.user_id"),
        primary_key=True,
        index=True,
    )
    world_id = Column(
        Integer,
        ForeignKey(settings.SCHEMA_NAME + ".world.world_id"),
        primary_key=True,
        index=True,
    )
    role_id = Column(
        Integer,
        ForeignKey(settings.SCHEMA_NAME + ".role.role_id"),
        nullable=False
    )
    avatar = Column(String(50))
    join_date = Column(TIMESTAMP, nullable=False)
    n_joins = Column(Integer, nullable=False)
    last_join = Column(TIMESTAMP, nullable=False)
    status = Column(Integer, nullable=False)
    username = Column(String(50))
    world = relationship("World", back_populates="users")
    user = relationship("User", back_populates="worlds")
