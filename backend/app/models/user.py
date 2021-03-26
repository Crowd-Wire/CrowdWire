from sqlalchemy import Column, Integer, String, Date, Boolean, Table, ForeignKey
from sqlalchemy.orm import relationship, backref


from app.db.base_class import Base

from .friend import friends
from .friend_request import friend_request

#TODO: datetime, default values..


class User(Base):

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    birth = Column(Date)
    register_date = Column(Date, nullable=False)

    world = relationship("World")

    # Many to Many relation with itself
    friends = relationship(
        'user',
        secondary=friends,
        primaryjoin=user_id == friends.c.user1_id,
        secondaryjoin=user_id == friends.c.user2_id,
    )

    # Many to Many relation with itself
    friend_request = relationship(
        'user',
        secondary=friend_request,
        primaryjoin=user_id == friend_request.c.sender,
        secondaryjoin=user_id == friend_request.c.receiver,
        backref=backref('received_requests')
    )
