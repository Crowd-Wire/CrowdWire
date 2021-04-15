from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, validator

from .tags import TagInDB


class BaseWorld(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_users: Optional[int] = None
    public: Optional[bool] = True
    creator: Optional[int]
    status: Optional[int] = None
    allow_guests: Optional[bool] = True
    tags: Optional[List[str]] = []

    @validator('max_users')
    def max_users_max_zero(cls, num):
        if num < 1:
            raise ValueError('Max_Users should be at least 1')
        return num


class WorldCreate(BaseWorld):
    name: str
    public: bool
    allow_guests: bool
    world_map: bytes
    tags: List[str]


class WorldUpdate(BaseWorld):
    world_map: Optional[bytes] = None


# Schemas to be Used to return data through API

class WorldInDB(BaseWorld):
    world_id: int
    creator: int  # for now it's enough only the ID of the User
    # only way to retrieve orm data on many-to many relationships
    tags: Optional[List[TagInDB]] = []
    creation_date: Optional[datetime] = None
    update_date: Optional[datetime] = None

    class Config:
        orm_mode = True


# Retrieve the Map of the World in the Database
class WorldMapInDB(WorldInDB):
    world_map: bytes
