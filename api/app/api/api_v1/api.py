from fastapi import APIRouter

from app.api.api_v1.endpoints import websocket, users, authentication, worlds, tags, roles, world_reports, events, \
    statistics

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(authentication.router)
api_router.include_router(
    websocket.router, prefix="/ws", tags=["websockets"]
)
api_router.include_router(worlds.router, prefix="/worlds", tags=["worlds"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
api_router.include_router(roles.router, prefix="/worlds/{world_id}/roles", tags=["roles"])
api_router.include_router(world_reports.router, prefix="/worlds/{world_id}/reports", tags=["reports"])
api_router.include_router(events.router, prefix="/worlds/{world_id}/events", tags=["events"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["statistics"])
