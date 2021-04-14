from typing import Optional

from pydantic import BaseModel


class TagsBase(BaseModel):
    name: Optional[str]


class TagsCreate(TagsBase):
    name: str


class TagsUpdate(TagsBase):
    pass


# properties to return to Client
class TagsInDB(BaseModel):
    name: str

    class Config:
        orm_mode = True
