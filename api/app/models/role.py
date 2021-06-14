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

    # alembic requires the attribute server default to work
    is_default = Column(Boolean, server_default='f', default=False)
    interact = Column(Boolean, server_default='f', default=False)
    walk = Column(Boolean, server_default='f', default=False)
    talk = Column(Boolean, server_default='f', default=False)
    talk_conference = Column(Boolean, server_default='f', default=False)
    world_mute = Column(Boolean, server_default='f', default=False)
    role_manage = Column(Boolean, server_default='f', default=False)
    conference_manage = Column(Boolean, server_default='f', default=False)
    chat = Column(Boolean, server_default='f', default=False)
    invite = Column(Boolean, server_default='f', default=False)
    ban = Column(Boolean, server_default='f', default=False)
