from typing import Optional

from pydantic import BaseModel


class TagBase(BaseModel):
    name: Optional[str]


class TagCreate(TagBase):
    name: str


class TagUpdate(TagBase):
    pass


# properties to return to Client
class TagInDB(BaseModel):
    name: str

    class Config:
        orm_mode = True
