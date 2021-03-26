from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column


class World_Settings(Base):

    world_id = Column(Integer, ForeignKey('fastapi.world.world_id'), primary_key=True, index=True)
    detection_radius = Column(Integer)
    max_users = Column(Integer)


