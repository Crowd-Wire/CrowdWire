from app.db.base_class import Base
from sqlalchemy import Column, String


class Tag(Base):
    """
    Tags used to search for worlds.
    """

    name = Column(String(30), primary_key=True)
