from typing import Optional, List
from typing_extensions import Annotated
from datetime import datetime
from pydantic import BaseModel, validator, Field

from .tags import TagInDB


class BaseWorld(BaseModel):
    name: Annotated[Optional[str], Field(max_length=50)] = None
    description: Annotated[Optional[str], Field(max_length=300)] = None
    max_users: Optional[int] = None
    public: Optional[bool] = True
    creator: Optional[int]
    status: Optional[int] = None
    allow_guests: Optional[bool] = True
    profile_image: Optional[bytes] = None
    tags: Optional[List[str]] = []

    @validator('max_users')
    def max_users_max_zero(cls, num):
        if num < 1 or num > 1000:
            raise ValueError('Max_Users should be between 1 and 1000')

        return num


class WorldCreate(BaseWorld):
    name: Annotated[str, Field(max_length=50)]
    public: bool
    allow_guests: bool
    tags: List[str]
    world_map: bytes


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


class WorldInDBWithUserPermissions(WorldInDB):
    is_creator: bool = False
    can_manage: bool = False
