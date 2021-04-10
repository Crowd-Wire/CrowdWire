from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class User(Base):

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    birth = Column(Date)
    register_date = Column(DateTime, nullable=False)
    status = Column(Integer, nullable=False)

    world = relationship("World")
