from datetime import datetime

from pydantic import BaseModel
from typing import Optional


class World_UserBase(BaseModel):
    avatar: Optional[str] = None
    status: Optional[int] = None
    username: Optional[str] = None
    user_id: Optional[int] = None
    world_id: Optional[int] = None


class World_UserCreate(World_UserBase):
    user_id: int
    world_id: int


class World_UserUpdate(World_UserBase):
    pass


# Base Schema to retrieve data from DB
class World_UserInDBBase:
    user_id: int
    world_id: int

    class Config:
        orm_mode = True


# Return Normal User's data when Joining World
class World_UserInDB(World_UserInDBBase):
    avatar: str
    username: str


# Return Data for Statistics
class World_UserInDBStats(World_UserInDBBase):
    n_joins: int
    join_date: datetime
    last_join: datetime
    status: int
