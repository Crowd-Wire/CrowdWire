from datetime import datetime

from pydantic import BaseModel, validator, UUID1
from typing import Optional, Union


class World_UserBase(BaseModel):
    avatar: Optional[str] = None
    username: Optional[str] = None
    status: Optional[int] = None
    user_id: Optional[int] = None
    world_id: Optional[int] = None

    @validator("avatar")
    def validate_avatar(cls, v):
        if v not in [str(i) for i in range(10)]:
            raise ValueError("Avatar name not Valid!")
        return v

    @validator("username")
    def validate_username(cls, v):
        if v is None:
            raise ValueError("Username not Valid.")
        return v


class World_UserCreate(World_UserBase):
    user_id: int
    world_id: int


class World_UserUpdate(World_UserBase):
    pass


# Base Schema to retrieve data from DB
class World_UserInDBBase(BaseModel):
    # user_id is an UUID1 for Guest Users
    user_id: Optional[Union[int, UUID1]]
    world_id: int

    class Config:
        orm_mode = True


# Return Normal User's data when Joining World
class World_UserInDB(World_UserInDBBase):
    avatar: Optional[str]
    username: Optional[str]


# Return Data for Statistics
class World_UserInDBStats(World_UserInDBBase):
    n_joins: int
    join_date: datetime
    last_join: datetime
    status: int
