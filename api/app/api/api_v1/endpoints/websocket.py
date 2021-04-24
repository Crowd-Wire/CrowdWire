from typing import Dict, List, Any, Tuple

from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from loguru import logger

from app.core.consts.WebsocketProtocol import *
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

            if topic == JOIN_PLAYER:
                join_player(world_id, user_id, payload)
                
            elif topic == PLAYER_MOVEMENT:
                send_player_movement(world_id, user_id, payload)

            elif topic == CHANGE_ROOM:
                pass
            elif topic == WIRE_PLAYER:
                pass
            elif topic == UNWIRE_PLAYER:
                pass
            
            elif topic in (JOIN_AS_NEW_PEER, JOIN_AS_SPEAKER):
                join_as_new_peer_or_speaker(world_id, user_id, payload)

            elif topic in (CONNECT_TRANSPORT, GET_RECV_TRACKS, CONNECT_TRANSPORT_SEND_DONE, SEND_TRACK):
                handle_transport_or_track(user_id, payload)

            elif topic == CLOSE_MEDIA:
                close_media(world_id, user_id, payload)

            elif topic == TOGGLE_PRODUCER:
                toggle_producer(world_id, user_id, payload)

            elif topic == SPEAKING_CHANGE:
                speaking_change(world_id, user_id, payload)

            else:
                logger.error(f"Unknown topic \"{topic}\"")
    except WebSocketDisconnect:
        manager.disconnect(world_id, room_id, user_id)

