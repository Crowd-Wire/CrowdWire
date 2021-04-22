from typing import Any
from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from loguru import logger
from app.api.api_v1.endpoints.connection_manager import manager
from app.rabbitmq.RabbitHandler import rabbit_handler
import json


"""
Class used to Manage the WebSocket Connections, to each World
"""
router = APIRouter()


@router.websocket(
    "/{world_id}",
)
async def world_movement(websocket: WebSocket, world_id: int) -> Any:
    user_id, room_id = await manager.connect(world_id, websocket)
    await manager.broadcast(
        world_id, room_id,
        {'topic': 'JOIN_PLAYER', 'user_id': user_id},
        user_id
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
                    user_id
                )
            elif topic == 'CHANGE_ROOM':
                pass
            elif topic == 'WIRE_PLAYER':
                pass
            elif topic == 'UNWIRE_PLAYER':
                pass
            # join-as-new-peer:
            # create a room if it doesnt exit and add that user to that room
            # then media server returns receive transport options to amqp
            # this should only allow to receive audio

            # join-as-speaker:
            # this does the same as above, except it allows
            # the user to speak, so, it returns two kinds of transport,
            # one for receiving and other for sending
            elif topic == "join-as-new-peer" or topic == "join-as-speaker":
                room_id = payload['d']['roomId']
                payload['d']['peerId'] = user_id

                if room_id in manager.connections[world_id][room_id]:
                    if user_id not in manager.connections[world_id][room_id]:
                        manager.connections[world_id][room_id].append(user_id)
                else:
                    manager.connections[world_id][room_id] = [user_id]

                await rabbit_handler.publish(json.dumps(payload))
            elif topic == "@connect-transport"\
                    or topic == "@get-recv-tracks"\
                    or topic == "@connect-transport-send-done"\
                    or topic == "@send-track":
                payload['d']['peerId'] = user_id
                await rabbit_handler.publish(json.dumps(payload))
            elif topic == "close-media":
                room_id = payload['d']['roomId']
                payload['d']['peerId'] = user_id

                # close in media server producer
                await rabbit_handler.publish(json.dumps(payload))

                # broadcast for peers to close this stream
                if user_id in manager.connections[world_id][room_id]:
                    await manager.broadcast(world_id, room_id,
                                            {'topic': 'close_media',
                                             'peerId': user_id},
                                            user_id)
            elif topic == "toggle-producer":
                room_id = payload['d']['roomId']
                kind = payload['d']['kind']
                pause = payload['d']['pause']
                payload['d']['peerId'] = user_id
                # pause in media server producer
                await rabbit_handler.publish(json.dumps(payload))
                # broadcast for peers to update UI toggle buttons
                if user_id in manager.connections[world_id][room_id]:
                    await manager.broadcast(world_id, room_id,
                                            {'topic': 'toggle_peer_producer',
                                             'peerId': user_id,
                                             'kind': kind,
                                             'pause': pause},
                                            user_id)
            elif topic == "speaking_change":
                room_id = payload['d']['roomId']
                value = payload['d']['value']
                logger.info(user_id)
                logger.info(manager.connections[world_id][room_id])
                if user_id in manager.connections[world_id][room_id]:
                    await manager.broadcast(world_id, room_id, {'topic': 'active_speaker', 'peerId': user_id, 'value': value}, user_id)
            else:
                logger.error(f"Unknown topic \"{topic}\"")
    except WebSocketDisconnect:
        manager.disconnect(world_id, room_id, user_id)
        await manager.broadcast(
            world_id, room_id,
            {'topic': 'LEAVE_PLAYER', 'user_id': user_id},
            user_id
        )
