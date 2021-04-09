from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String, Boolean
from app.core.config import settings


class Role(Base):

    role_id = Column(Integer, primary_key=True, index=True)
    world_id = Column(
        Integer, ForeignKey(settings.SCHEMA_NAME + ".world.world_id"), nullable=False
    )
    name = Column(String(30), unique=True, nullable=False)
    interact = Column(Boolean)
    walk = Column(Boolean)
