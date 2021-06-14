from datetime import datetime

from pydantic import BaseModel, validator, UUID4, Field
from typing import Optional, Union, Dict

from typing_extensions import Annotated

from app.core.consts import AVATARS_LIST
from app.schemas import RoleInDB


class World_UserBase(BaseModel):
    avatar: Annotated[Optional[str], Field(max_length=50)] = None
    username: Annotated[Optional[str], Field(max_length=50)] = None
    status: Optional[int] = None
    user_id: Optional[int] = None
    world_id: Optional[int] = None

    @validator("avatar")
    def validate_avatar(cls, v):
        if v not in AVATARS_LIST:
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


class World_UserUpdate(BaseModel):
    username: Annotated[Optional[str], Field(max_length=50)] = None
    avatar: Annotated[Optional[str], Field(max_length=50)] = None
    status: Optional[int]

    @validator("avatar")
    def validate_avatar(cls, v):
        if v is not None and v not in AVATARS_LIST:
            raise ValueError("Avatar name not Valid!")
        return v


# Base Schema to retrieve data from DB
class World_UserInDBBase(BaseModel):
    # user_id is an UUID4 for Guest Users
    user_id: Optional[Union[UUID4, int]]
    world_id: int
    status: Optional[int]

    class Config:
        orm_mode = True


# Return Normal User's data when Joining World
class World_UserInDB(World_UserInDBBase):
    avatar: Annotated[Optional[str], Field(max_length=50)] = None
    username: Annotated[Optional[str], Field(max_length=50)] = None
    role_id: int


# Used to Return The Details Of A role
# instead of only the id, useful to avoid more
# requests to the API
class World_UserWithRoleInDB(World_UserInDBBase):
    avatar: Annotated[Optional[str], Field(max_length=50)] = None
    username: Annotated[Optional[str], Field(max_length=50)] = None
    role: RoleInDB
    last_pos: Optional[Dict[str, float]] = {}


class World_UserWithRoleAndMap(World_UserWithRoleInDB):
    world_map: bytes


# Return Data for Statistics
class World_UserInDBStats(World_UserInDBBase):
    n_joins: int
    join_date: datetime
    last_join: datetime
    status: int
