from fastapi import APIRouter

from app.api.api_v1.endpoints import websocket, users, login, worlds, tags

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(login.router)
api_router.include_router(
    websocket.router, prefix="/ws", tags=["websockets"]
)
api_router.include_router(worlds.router, prefix="/worlds", tags=["worlds"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])