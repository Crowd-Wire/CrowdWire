from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String


class User_Settings(Base):

    user_id = Column(Integer, ForeignKey('fastapi.user.user_id'), primary_key=True, index=True)
