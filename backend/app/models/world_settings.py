from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column
from app.core.config import settings


class World_Settings(Base):

    world_id = Column(Integer, ForeignKey(settings.SCHEMA_NAME+'.world.world_id'), primary_key=True, index=True)
    detection_radius = Column(Integer)
    max_users = Column(Integer)


