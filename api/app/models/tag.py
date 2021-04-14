from sqlalchemy.orm import relationship, backref

from app.db.base_class import Base
from sqlalchemy import Column, String

from app.models.world_tag import world_tag


class Tag(Base):
    """
    Tags used to search for worlds.
    """

    name = Column(String(30), primary_key=True)
    worlds = relationship("World", secondary=world_tag, back_populates='tags')
