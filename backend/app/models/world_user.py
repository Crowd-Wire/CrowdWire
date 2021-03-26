from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String, Date, Table


world_user = Table('world_user', Base.metadata,
                   Column('user_id', Integer, ForeignKey('fastapi.user.user_id'), primary_key=True, index=True),
                   Column('world_id', Integer, ForeignKey('fastapi.world.world_id'), primary_key=True, index=True),
                   Column('name', String(30), ForeignKey('fastapi.role.name'), nullable=False),
                   Column('avatar', String(50))
                   )

"""
class World_User(Base):

    user_id = Column(Integer, ForeignKey('user.user_id'), primary_key=True, index=True)
    world_id = Column(Integer, ForeignKey('role.world_id'), primary_key=True, index=True)
    role_name = Column(String(30), ForeignKey('role.name'), nullable=False)
    join_date = Column(Date, nullable=False)
"""