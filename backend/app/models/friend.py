from sqlalchemy import Column, Integer, ForeignKey, Table

from app.db.base_class import Base

friends = Table(
    'friend',
    Base.metadata,
    Column('user1_id', Integer, ForeignKey('fastapi.user.user_id'), primary_key=True),
    Column('user2_id', Integer, ForeignKey('fastapi.user.user_id'), primary_key=True)
)
