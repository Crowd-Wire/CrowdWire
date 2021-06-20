import datetime
from typing import Optional

from pydantic import BaseModel


class EventBase(BaseModel):
    event_type: Optional[str] = None
    timestamp: Optional[datetime.datetime] = None


class EventCreate(EventBase):
    event_type: str
    world_id: int
    user_id: int


class EventUpdate(EventBase):
    pass


class EventInDB(EventBase):
    world_id: int
    user_id: int

    class Config:
        orm_mode = True
