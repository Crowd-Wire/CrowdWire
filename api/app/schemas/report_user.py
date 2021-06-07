from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from typing_extensions import Annotated


class ReportUserBase(BaseModel):
    reporter: Optional[int]
    reported: Optional[int]
    world_id: Optional[int]
    comment: Annotated[Optional[str], Field(max_length=300)]
    timestamp: Optional[datetime]


class ReportUserCreate(ReportUserBase):
    world_id: int
    comment: Optional[str]


class ReportUserUpdate(BaseModel):
    reviewed: bool


class ReportUserInDB(ReportUserBase):
    reporter: int
    reported: int
    world_id: int
    comment: Annotated[str, Field(max_length=300)]
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
