from typing import Dict, List, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter



"""
Class used to Manage the WebSocket Connections, to each World
"""
router = APIRouter()


class ConnectionManager:
    def __init__(self):
        """
        Dictionary with the World_id as key and the List of Active Connections as
        value
        """
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, world_id: int, websocket: WebSocket):
        await websocket.accept()

        if world_id not in self.active_connections:
            self.active_connections[world_id] = [websocket]
        else:
            self.active_connections[world_id].append(websocket)

    def disconnect(self, world_id: int, websocket: WebSocket):
        self.active_connections[world_id].remove(websocket)
        if not self.active_connections[world_id]:
            self.active_connections.pop(world_id)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, world_id: int, message: str):
        if world_id in self.active_connections:
            for connection in self.active_connections[world_id]:
                await connection.send_text(message)


manager = ConnectionManager()


@router.websocket('/{world_id}',)
async def world_movement(websocket: WebSocket, world_id: int) -> Any:
    await manager.connect(world_id,websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast(world_id, f"World id #{websocket} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(world_id, websocket)
        await manager.broadcast(world_id, f"Client #{websocket} left the chat")
