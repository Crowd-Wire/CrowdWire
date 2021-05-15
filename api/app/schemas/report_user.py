from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReportUserBase(BaseModel):
    reporter: Optional[int]
    reported: Optional[int]
    world_id: Optional[int]
    comment: Optional[str]
    timestamp: Optional[datetime]


class ReportUserCreate(ReportUserBase):
    reported: int
    world_id: int
    comment: Optional[str]
    timestamp: datetime


class ReportUserInDB(ReportUserBase):
    reporter: int
    reported: int
    world_id: int
    comment: str
    timestamp: datetime

    class Config:
        orm_mode = True
