from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class User(Base):
    """
    User of the platform.
    """

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), index=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    birth = Column(Date)
    register_date = Column(DateTime, nullable=False)
    status = Column(Integer, nullable=False)
    is_superuser = Column(Boolean, nullable=False)
    worlds = relationship("World_User", back_populates="user")
