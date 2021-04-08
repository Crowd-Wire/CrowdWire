from fastapi import APIRouter
from app.api.api_v1.endpoints import world_movement, users, login

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(login.router)
api_router.include_router(
    world_movement.router, prefix="/position", tags=["world_movement"]
)
