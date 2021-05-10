from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String, TIMESTAMP, LargeBinary, Boolean
from sqlalchemy.orm import relationship
from app.core.config import settings
from .world_tag import world_tag


class World(Base):
    """
    A world is made by a user.
    """

    world_id = Column(Integer, primary_key=True, autoincrement=True)
    creator = Column(Integer, ForeignKey(settings.SCHEMA_NAME + ".user.user_id"))
    name = Column(String(30), nullable=False)
    creation_date = Column(TIMESTAMP, nullable=False)
    update_date = Column(TIMESTAMP)
    description = Column(String(300))
    max_users = Column(Integer)
    public = Column(Boolean, nullable=False)
    allow_guests = Column(Boolean, nullable=False)
    world_map = Column(LargeBinary, nullable=False)
    status = Column(Integer, nullable=False)
    tags = relationship("Tag", lazy="subquery", secondary=world_tag)
    users = relationship("World_User", back_populates="world")
