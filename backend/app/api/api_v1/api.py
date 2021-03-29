from fastapi import APIRouter

from app.api.api_v1.endpoints import users,world_movement

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(world_movement.router, prefix="/positions", tags=["world_movement"])
