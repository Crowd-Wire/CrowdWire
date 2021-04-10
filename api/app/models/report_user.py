from sqlalchemy import Column, Integer, ForeignKey, String, TIMESTAMP
from app.db.base_class import Base
from app.core.config import settings


class Report_User(Base):
    """
    A user can report another user in a given world.
    """

    reported = Column(Integer, ForeignKey(settings.SCHEMA_NAME+'.user.user_id'), nullable=False, primary_key=True)
    reporter = Column(Integer, ForeignKey(settings.SCHEMA_NAME+'.user.user_id'), nullable=False, primary_key=True)
    world_id = Column(Integer, ForeignKey(settings.SCHEMA_NAME+'.world.world_id'), nullable=False, primary_key=True)
    timestamp = Column(TIMESTAMP, nullable=False)
    comment = Column(String(300))
