from app.db.base_class import Base
from sqlalchemy import Column, String


class Tag(Base):

    name = Column(String(30), primary_key=True, index=True)
