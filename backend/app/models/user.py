from sqlalchemy import Column, Integer, String, Date, Boolean
from sqlalchemy.orm import relationship, backref


from app.db.base_class import Base

from .friend import friends
from .friend_request import friend_request


class User(Base):

    #__tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    birth = Column(Date)
    register_date = Column(Date, nullable=False)


    # Many to Many relation with itself
    friends = relationship(
        'User',
        secondary=friends,
        primaryjoin=id == friends.c.user1_id,
        secondaryjoin=id == friends.c.user2_id,
    )

    # Many to Many relation with itself
    friend_request = relationship(
        'User',
        secondary=friend_request,
        primaryjoin=id == friend_request.c.sender,
        secondaryjoin=id == friend_request.c.receiver,
        backref=backref('received_requests')
    )

