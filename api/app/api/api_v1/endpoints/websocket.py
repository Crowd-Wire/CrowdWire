from typing import Any, Optional

from app.websocket.connection_manager import manager
from app.websocket import websocket_handler as wh
from app.api import dependencies as deps
from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Query, Depends
from app.core.consts import WebsocketProtocol as protocol
from loguru import logger
import asyncio

"""
Class used to Manage the WebSocket Connections, to each World
"""
router = APIRouter()

HEART_BEAT_INTERVAL = 5

async def is_websocket_active(ws: WebSocket) -> bool:
    try:
        await asyncio.wait_for(ws.send_json({'type': 'ping'}), HEART_BEAT_INTERVAL)
        message = await asyncio.wait_for(ws.receive_json(), HEART_BEAT_INTERVAL)
        assert message['type'] == 'pong'
    except BaseException:
        return False
    return True


@router.websocket(
    "/{world_id}",
)
async def world_websocket(
        websocket: WebSocket, world_id: str,
        token: Optional[str] = Query(None),
        user_id: str = Depends(deps.get_websockets_user)
) -> Any:
    # overwrites user_id given by token TODO: remove after tests
    user_id = manager.get_next_user_id()
    await manager.connect(world_id, websocket, user_id)
    # default room id when joining world
    # maybe on the function disconnect_room()
    # check which room he is on instead of this
    room_id = 0

    try:
        while True:
            payload = await websocket.receive_json()
            topic = payload['topic']

            if topic != protocol.PLAYER_MOVEMENT:
                logger.info(
                    f"Received message with topic {topic} from user {user_id}"
                )

            if  topic == protocol.PING:
                await websocket.send_text(protocol.PONG)

            elif topic == protocol.JOIN_PLAYER:
                room_id = payload['room_id']
                await wh.join_player(world_id, user_id, payload)
                await wh.send_groups_snapshot(world_id, user_id)

            elif topic == protocol.PLAYER_MOVEMENT:
                await wh.send_player_movement(world_id, user_id, payload)

            elif topic == protocol.CHANGE_ROOM:
                pass
            elif topic == protocol.WIRE_PLAYER:
                await wh.wire_players(world_id, user_id, payload)

            elif topic == protocol.UNWIRE_PLAYER:
                await wh.unwire_players(world_id, user_id, payload)

            elif topic in (protocol.JOIN_AS_NEW_PEER, protocol.JOIN_AS_SPEAKER):
                await wh.join_as_new_peer_or_speaker(world_id, user_id, payload)

            elif topic in (
                    protocol.CONNECT_TRANSPORT, protocol.GET_RECV_TRACKS,
                    protocol.CONNECT_TRANSPORT_SEND_DONE, protocol.SEND_TRACK):
                await wh.handle_transport_or_track(user_id, payload)

            elif topic == protocol.CLOSE_MEDIA:
                await wh.close_media(world_id, user_id, payload)

            elif topic == protocol.TOGGLE_PRODUCER:
                await wh.toggle_producer(world_id, user_id, payload)

            elif topic == protocol.SPEAKING_CHANGE:
                await wh.speaking_change(world_id, user_id, payload)

            else:
                logger.error(f"Unknown topic \"{topic}\"")
    except WebSocketDisconnect:
        logger.info("disconnected ")
        manager.disconnect(world_id, user_id)
        await manager.disconnect_room(world_id, room_id, user_id)
        await wh.disconnect_user(world_id, user_id)
    except BaseException:
        logger.info("base exc")
        manager.disconnect(world_id, user_id)
        await manager.disconnect_room(world_id, room_id, user_id)
        await wh.disconnect_user(world_id, user_id)
