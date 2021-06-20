from typing import Optional

from pydantic import BaseModel, Field
from typing_extensions import Annotated


class RoleBase(BaseModel):
    world_id: Optional[int] = None
    name: Annotated[Optional[str], Field(max_length=50)] = None
    is_default: Optional[bool]
    interact: Optional[bool]
    walk: Optional[bool]
    talk: Optional[bool]
    talk_conference: Optional[bool]
    world_mute: Optional[bool]
    role_manage: Optional[bool]
    conference_manage: Optional[bool]
    chat: Optional[bool]
    invite: Optional[bool]
    ban: Optional[bool]


class RoleCreate(RoleBase):
    world_id: int
    name: Annotated[str, Field(max_length=50)]


class RoleUpdate(RoleBase):
    pass


class RoleInDB(RoleBase):
    role_id: int
    world_id: int

    class Config:
        orm_mode = True
