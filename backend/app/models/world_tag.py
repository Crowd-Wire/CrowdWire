from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String, Table
from app.core.config import settings


world_tag = Table('world_tag', Base.metadata,
                  Column('world_id', Integer, ForeignKey(settings.SCHEMA_NAME+'.world.world_id'), primary_key=True),
                  Column('tag_name', String(30), ForeignKey(settings.SCHEMA_NAME+'.tag.name'), primary_key=True)
                  )
