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
    world_id: int
    comment: Optional[str]


class ReportUserInDB(ReportUserBase):
    reporter: int
    reported: int
    world_id: int
    comment: str
    timestamp: datetime
    reviewed: bool

    class Config:
        orm_mode = True


class ReportUserInDBDetailed(ReportUserInDB):
    reporter_name: str
    reported_name: str
    reporter_email: str
    reported_email: str
    world_name: str
