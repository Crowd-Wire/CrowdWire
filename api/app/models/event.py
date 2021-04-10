from sqlalchemy import Column, Integer, ForeignKey, String, TIMESTAMP
from app.db.base_class import Base
from app.core.config import settings


class Event(Base):
    """
    Used to keep track of events of a user in a given world.
    """

    event_id = Column(Integer, primary_key=True, autoincrement=True)
    world_id = Column(Integer, ForeignKey(settings.SCHEMA_NAME + '.world.world_id'), nullable=False)
    user_id = Column(Integer, ForeignKey(settings.SCHEMA_NAME + '.user.user_id'), nullable=False)
    event_type = Column(String(50), nullable=False)
    timestamp = Column(TIMESTAMP, nullable=False)
