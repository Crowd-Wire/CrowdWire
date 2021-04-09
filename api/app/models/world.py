from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String, DateTime
from sqlalchemy.orm import relationship
from app.core.config import settings


class World(Base):
    world_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), nullable=False)
    creation_date = Column(DateTime, nullable=False)
    update_date = Column(DateTime)
    description = Column(String(300))
    creator_id = Column(Integer, ForeignKey(settings.SCHEMA_NAME + ".user.user_id"))

    tags = relationship("Tag", secondary="world_tag")
