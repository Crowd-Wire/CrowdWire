from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String, Table

world_tag = Table('world_tag', Base.metadata,
                  Column('world_id', Integer, ForeignKey('fastapi.world.world_id'), primary_key=True),
                  Column('tag_name', String(30), ForeignKey('fastapi.tag.name'), primary_key=True)
                  )
