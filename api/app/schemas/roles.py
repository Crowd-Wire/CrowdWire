from typing import Optional

from pydantic import BaseModel


class RoleBase(BaseModel):
    world_id: Optional[int] = None
    name: Optional[str] = None
    is_default: Optional[bool]
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
    name: str


class RoleUpdate(BaseModel):
    pass


class RoleInDB(RoleBase):
    role_id: int
    world_id: int

    class Config:
        orm_mode = True
