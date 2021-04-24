from typing import Any

from app.api.api_v1.endpoints import connection_manager as cm
from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from app.core.consts import WebsocketProtocol as protocol
from loguru import logger

"""
Class used to Manage the WebSocket Connections, to each World
"""
router = APIRouter()


@router.websocket(
    "/{world_id}",
)
async def websocket_handler(websocket: WebSocket, world_id: str) -> Any:
    user_id = await cm.manager.connect(world_id, websocket)

    try:
        while True:
            payload = await websocket.receive_json()
            topic = payload['topic']

            if topic == protocol.JOIN_PLAYER:
                await cm.join_player(world_id, user_id, payload)

            elif topic == protocol.PLAYER_MOVEMENT:
                await cm.send_player_movement(world_id, user_id, payload)

            elif topic == protocol.CHANGE_ROOM:
                pass
            elif topic == protocol.WIRE_PLAYER:
                pass
            elif topic == protocol.UNWIRE_PLAYER:
                pass

            elif topic in (protocol.JOIN_AS_NEW_PEER, protocol.JOIN_AS_SPEAKER):
                await cm.join_as_new_peer_or_speaker(world_id, user_id, payload)

            elif topic in (
                    protocol.CONNECT_TRANSPORT, protocol.GET_RECV_TRACKS,
                    protocol.CONNECT_TRANSPORT_SEND_DONE, protocol.SEND_TRACK):
                await cm.handle_transport_or_track(user_id, payload)

            elif topic == protocol.CLOSE_MEDIA:
                await cm.close_media(world_id, user_id, payload)

            elif topic == protocol.TOGGLE_PRODUCER:
                await cm.toggle_producer(world_id, user_id, payload)

            elif topic == protocol.SPEAKING_CHANGE:
                await cm.speaking_change(world_id, user_id, payload)

            else:
                logger.error(f"Unknown topic \"{topic}\"")
    except WebSocketDisconnect:
        cm.manager.disconnect(world_id, user_id)
        # TODO: disconnect from room
