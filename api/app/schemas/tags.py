from typing import Optional
from typing_extensions import Annotated

from pydantic import BaseModel, Field


class TagBase(BaseModel):
    name: Annotated[Optional[str], Field(max_length=50)]


class TagCreate(TagBase):
    name: Annotated[str, Field(max_length=50)]


class TagUpdate(TagBase):
    pass


# properties to return to Client
class TagInDB(BaseModel):
    name: str

    class Config:
        orm_mode = True
