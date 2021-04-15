from sqlalchemy.orm import relationship
from app.db.base_class import Base
from sqlalchemy import Column, String

from .world_tag import world_tag


class Tag(Base):
    """
    Tags used to search for worlds.
    """

    name = Column(String(30), primary_key=True)

    worlds = relationship("World", world_tag)
