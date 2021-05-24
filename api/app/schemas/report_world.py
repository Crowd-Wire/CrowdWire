from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReportWorldBase(BaseModel):
    reporter: Optional[int]
    reported: Optional[int]
    timestamp: Optional[datetime]
    comment: Optional[str]


# does not need the id of the reporter because it is necessary a token
class ReportWorldCreate(ReportWorldBase):
    comment: str


class ReportWorldUpdate(BaseModel):
    reporter: int
    reviewed: bool


class ReportWorldInDB(ReportWorldBase):
    reported: int
    reporter: int
    timestamp: datetime
    comment: str
    reviewed: bool

    class Config:
        orm_mode = True


class ReportWorldInDBWithEmail(ReportWorldInDB):
    reporter_email: str
    world_name: str
    banned: int
