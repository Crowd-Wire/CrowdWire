from typing import List

from pydantic import BaseModel

from app.schemas import UserUpdate


class BaseResponseWorld(BaseModel):
    world_id: int
    creator: UserUpdate
    name: str
    description: str
    max_users: int
    public: bool
    status: int
    tags: List[str]