from typing import Dict, List, Any, Tuple

from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from loguru import logger

from app.core.consts import WebsocketProtocol as protocol
from app.api.api_v1.endpoints.connection_manager import * 
from app.rabbitmq.RabbitHandler import rabbit_handler
import json

"""
Class used to Manage the WebSocket Connections, to each World
"""
router = APIRouter()


@router.websocket(
    "/{world_id}",
)
async def websocket_handler(websocket: WebSocket, world_id: str) -> Any:
    user_id = await manager.connect(world_id, websocket)
    
    try:
        while True:
            payload = await websocket.receive_json()
            topic = payload['topic']

            if topic == protocol.JOIN_PLAYER:
                await join_player(world_id, user_id, payload)
                
            elif topic == protocol.PLAYER_MOVEMENT:
                await send_player_movement(world_id, user_id, payload)

            elif topic == protocol.CHANGE_ROOM:
                pass
            elif topic == protocol.WIRE_PLAYER:
                pass
            elif topic == protocol.UNWIRE_PLAYER:
                pass
            
            elif topic in (protocol.JOIN_AS_NEW_PEER, protocol.JOIN_AS_SPEAKER):
                await join_as_new_peer_or_speaker(world_id, user_id, payload)

            elif topic in (
                    protocol.CONNECT_TRANSPORT, protocol.GET_RECV_TRACKS, 
                    protocol.CONNECT_TRANSPORT_SEND_DONE, protocol.SEND_TRACK):
                await handle_transport_or_track(user_id, payload)

            elif topic == protocol.CLOSE_MEDIA:
                await close_media(world_id, user_id, payload)

            elif topic == protocol.TOGGLE_PRODUCER:
                await toggle_producer(world_id, user_id, payload)

            elif topic == protocol.SPEAKING_CHANGE:
                await speaking_change(world_id, user_id, payload)

            else:
                logger.error(f"Unknown topic \"{topic}\"")
    except WebSocketDisconnect:
        manager.disconnect(world_id, room_id, user_id)

