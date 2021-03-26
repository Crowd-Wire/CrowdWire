from sqlalchemy import Boolean, Column, Integer, Date, ForeignKey, Table

from app.db.base_class import Base

friend_request = Table(
    'friend_request',
    Base.metadata,
    Column('sender', Integer, ForeignKey('user.id'), primary_key=True),
    Column('receiver', Integer, ForeignKey('user.id'), primary_key=True),
    Column('send_date', Date),
    Column('pending', Boolean)
)