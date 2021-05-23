from typing import Any, Optional, Union

from app.utils import is_guest_user
from app.websockets.connection_manager import manager
from app.websockets import websocket_handler as wh
from app.api import dependencies as deps
from app.crud.crud_events import crud_event
from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Query, Depends
from app.core.consts import WebsocketProtocol as protocol
from loguru import logger
from app.api import dependencies
from sqlalchemy.orm import Session
from app import models, schemas


"""
Class used to Manage the WebSocket Connections, to each World
"""
router = APIRouter()


@router.websocket(
    "/{world_id}",
)
async def world_websocket(
        websocket: WebSocket, world_id: int,
        token: Optional[str] = Query(None),
        user: Union[models.User, schemas.GuestUser] = Depends(deps.get_websockets_user),
        db: Session = Depends(dependencies.get_db)
) -> Any:
    # overwrites user_id given by token TODO: remove after tests
    user_id = manager.get_next_user_id()
    # user_id = str(user.user_id)
    world_id = str(world_id)
    logger.info(user_id)
    await manager.connect(world_id, websocket, user_id)
    # TODO: maybe refactor to Chain of Responsibility pattern, maybe not
    try:
        while True:
            payload = await websocket.receive_json()
            topic = payload['topic']

            if topic == protocol.PING:
                await websocket.send_text(protocol.PONG)
                continue

            if topic == protocol.PLAYER_MOVEMENT:
                await wh.send_player_movement(world_id, user_id, payload)
                continue

            logger.info(f"Received message with topic {topic} from user {user_id}")

            if topic in (
                protocol.CONNECT_TRANSPORT, protocol.GET_RECV_TRACKS,
                protocol.CONNECT_TRANSPORT_SEND_DONE, protocol.SEND_TRACK, protocol.SEND_FILE
            ):
                await wh.handle_transport_or_track(world_id, user_id, payload)

            elif topic == protocol.WIRE_PLAYER:
                await wh.wire_players(world_id, user_id, payload)

            elif topic == protocol.UNWIRE_PLAYER:
                await wh.unwire_players(world_id, user_id, payload)

            elif topic == protocol.SEND_MESSAGE:
                await wh.send_message(world_id, user_id, payload)

            elif topic == protocol.JOIN_PLAYER:
                await wh.join_player(world_id, user_id, payload)
                if not is_guest_user(user):
                    crud_event.create(db=db,
                                      user_id=user.user_id,
                                      world_id=world_id,
                                      event_type=protocol.JOIN_PLAYER)

            elif topic == protocol.JOIN_CONFERENCE:
                await wh.join_conference(world_id=world_id, user_id=user_id, payload=payload)
                if not is_guest_user(user):
                    crud_event.create(db=db,
                                      user_id=user.user_id,
                                      world_id=world_id,
                                      event_type=protocol.JOIN_CONFERENCE)

            elif topic == protocol.LEAVE_CONFERENCE:
                await wh.leave_conference(world_id, user_id, payload)
                if not is_guest_user(user):
                    crud_event.create(db=db,
                                      user_id=user.user_id,
                                      world_id=world_id,
                                      event_type=protocol.LEAVE_CONFERENCE)

            elif topic == protocol.CLOSE_MEDIA:
                await wh.close_media(world_id, user_id, payload)

            elif topic == protocol.TOGGLE_PRODUCER:
                await wh.toggle_producer(world_id, user_id, payload)

            elif topic == protocol.REQUEST_TO_SPEAK:
                # send to users who are in conference and have conference_managent permission
                await wh.send_to_conf_managers(world_id=world_id, user_id=user_id, payload=payload)

            elif topic == protocol.PERMISSION_TO_SPEAK:
                # check if user who accepted has permission
                # warn the user who has been accepted or denied
                await wh.send_to_conf_listener(world_id=world_id, user_id=user_id, payload=payload)

            elif topic == protocol.GET_ROOM_USERS_FILES:
                await wh.get_room_users_files(world_id=world_id, user_id=user_id)

            elif topic == protocol.REMOVE_ALL_USER_FILES:
                await wh.remove_all_user_files(world_id=world_id, user_id=user_id)

            elif topic == protocol.ADD_USER_FILES:
                await wh.add_user_files(world_id=world_id, user_id=user_id, payload=payload)

            elif topic == protocol.REMOVE_USER_FILE:
                await wh.remove_user_file(world_id=world_id, user_id=user_id, payload=payload)

            elif topic == protocol.REQUEST_TO_DOWNLOAD:
                await wh.request_to_download(world_id=world_id, user_id=user_id, payload=payload)

            elif topic == protocol.SPEAKING_CHANGE:
                await wh.speaking_change(world_id, user_id, payload)

            else:
                logger.error(f"Unknown topic \"{topic}\"")
    except WebSocketDisconnect:
        logger.info("disconnected ")
    # except BaseException:
    #     logger.info("base exc")
        await manager.disconnect(world_id, user_id)
        await wh.disconnect_user(world_id, user_id)
        if not is_guest_user(user):
            crud_event.create(db=db,
                            user_id=user.user_id,
                            world_id=world_id,
                            event_type=protocol.LEAVE_PLAYER)
