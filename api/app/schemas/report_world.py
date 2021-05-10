from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportWorldBase(BaseModel):
    reporter: Optional[int]
    reported: Optional[int]
    timestamp: Optional[datetime]
    comment: Optional[str]

class ReportWorldCreate(BaseModel):
    reporter: int
    reported: int
    timestamp: datetime
    comment: str

class ReportWorldInDBWithUsername(ReportWorldBase):
    reporter_username: str
    reported_username: str
