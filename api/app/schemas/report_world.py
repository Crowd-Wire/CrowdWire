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
    reported: int
    timestamp: datetime
    comment: str

    class Config:
        orm_mode = True


class ReportWorldInDBWithEmail(ReportWorldBase):
    reporter_email: str
    world_name: str
