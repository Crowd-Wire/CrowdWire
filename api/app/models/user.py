from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class User(Base):
    """
    User of the platform.
    """

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    birth = Column(Date)
    register_date = Column(DateTime, nullable=False)
    status = Column(Integer, nullable=False)

    world = relationship("World")
