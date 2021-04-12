from typing import Dict, List, Any, Tuple

from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from loguru import logger


"""
Class used to Manage the WebSocket Connections, to each World
"""
router = APIRouter()


class ConnectionManager:
    count = 0

    def __init__(self):
        """
        Dictionary with the World_id as key and the List of Active Connections as
        value
        """
        self.connections: Dict[int, Dict[int, List[WebSocket]]] = {}

    async def connect(self, world_id: int, websocket: WebSocket) -> Tuple[int, int]:
        await websocket.accept()

        payload = await websocket.receive_json()
        room_id = payload['room_id']
        # futurely, get token from message and retrieve it's id??? guests will have a G prepended, ig
        user_id = self.count
        self.count += 1

        self.connections \
            .setdefault(world_id, {}) \
            .setdefault(room_id, []) \
            .append(websocket)

        logger.info(
            f"New connection added to World {world_id}, Room {room_id}"
        )

        return user_id, room_id

    def disconnect(self, world_id: int, room_id: int, websocket: WebSocket):
        try:
            self.connections[world_id][room_id].remove(websocket)
            if not self.connections[world_id][room_id]:
                self.connections[world_id].pop(room_id)
                if not self.connections[world_id]:
                    self.connections.pop(world_id)
            logger.info(f"Connection removed from World {world_id}, Room {room_id}")
        except KeyError:
            logger.error(
                f"Error when trying to remove connection from World {world_id}, "
                f"Room {room_id}"
            )

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, world_id: int, room_id: int, payload: dict, websocket: WebSocket):
        try:
            for connection in self.connections[world_id][room_id]:
                if connection != websocket:
                    await connection.send_json(payload)
            logger.info(
                f"Broadcasted to" f" World {world_id}, Room {room_id} the message: "
                f"{payload}"
            )
        except KeyError:
            logger.error(
                f"Error when trying to broadcast to World {world_id}, Room {room_id}"
            )


manager = ConnectionManager()


@router.websocket(
    "/{world_id}",
)
async def world_movement(websocket: WebSocket, world_id: int) -> Any:
    user_id, room_id = await manager.connect(world_id, websocket)
    await manager.broadcast(
        world_id, room_id,
        {'topic': 'JOIN_PLAYER', 'user_id': user_id},
        websocket
    )
    try:
        while True:
            payload = await websocket.receive_json()
            topic = payload['topic']
            if topic == 'PLAYER_MOVEMENT':
                print(payload)
                room_id = payload['room_id']
                direction = payload['direction']
                await manager.broadcast(
                    world_id, room_id,
                    {'topic': 'PLAYER_MOVEMENT', 'user_id': user_id, 'direction': direction},
                    websocket
                )
            elif topic == 'CHANGE_ROOM':
                pass
            elif topic == 'WIRE_PLAYER':
                pass
            elif topic == 'UNWIRE_PLAYER':
                pass
            else:
                logger.error(f"Unknown topic \"{topic}\"")
    except WebSocketDisconnect:
        manager.disconnect(world_id, room_id, websocket)
        await manager.broadcast(
            world_id, room_id,
            {'topic': 'LEAVE_PLAYER', 'user_id': user_id},
            websocket
        )
