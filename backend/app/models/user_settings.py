from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String
from app.core.config import settings


class User_Settings(Base):

    user_id = Column(Integer, ForeignKey(settings.SCHEMA_NAME+'.user.user_id'), primary_key=True, index=True)
