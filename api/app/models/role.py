from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String, Boolean
from app.core.config import settings


class Role(Base):
    """
    A world can have multiple roles.
    """

    role_id = Column(Integer, primary_key=True, autoincrement=True)
    world_id = Column(
        Integer, ForeignKey(settings.SCHEMA_NAME + ".world.world_id"),
        nullable=False
    )
    name = Column(String(30), nullable=False)
    is_default = Column(Boolean)
    interact = Column(Boolean)
    walk = Column(Boolean)
    talk = Column(Boolean)
    talk_conference = Column(Boolean)
    world_mute = Column(Boolean)
    role_manage = Column(Boolean)
    conference_manage = Column(Boolean)
    chat = Column(Boolean)
    invite = Column(Boolean)
    ban = Column(Boolean)
