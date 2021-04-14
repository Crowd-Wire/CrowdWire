from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class BaseWorld(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_users: Optional[int] = None
    public: Optional[bool] = True
    status: Optional[int] = None
    allow_guests: Optional[bool] = True


class WorldCreate(BaseWorld):
    name: str
    public: bool
    creator: int  # id of the User
    allow_guests: bool
    world_map: bytes
    tags: List[str]


class WorldUpdate(BaseWorld):
    world_map: Optional[bytes] = None


class WorldInDB(BaseWorld):
    world_id: int
    creator: int
    creation_date: Optional[datetime] = None
    update_date: Optional[datetime] = None

    class Config:
        orm_mode = False


# Retrieve the Map of the World in the Database
class WorldMapInDB(WorldInDB):
    world_map: bytes
