from pydantic import BaseModel
from typing import List, Any


class GlobalStatistics(BaseModel):
    users: int
    worlds: int
    user_reports: int
    world_reports: int
    online_users: int


class WorldStatistics(BaseModel):
    world_id: int
    total_users: int
    online_users: int
    reports: int
    total_n_joins: int
    user_joined_overtime: List[Any]
