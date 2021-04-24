from typing import Dict, List, Any, Tuple

from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from loguru import logger

from app.core.consts import *
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
async def websocket_handler(websocket: WebSocket, world_id: str) -> Any:
    user_id = await manager.connect(world_id, websocket)
    
    try:
        while True:
            payload = await websocket.receive_json()
            topic = payload['topic']

            if topic == JOIN_PLAYER:
                room_id = payload['room_id']
                position = payload['position']
                await manager.connect_room(world_id, room_id, user_id, position)
                
            elif topic == PLAYER_MOVEMENT:
                room_id = payload['room_id']
                velocity = payload['velocity']
                position = payload['position']
                await manager.broadcast(
                    world_id, room_id,
                    {'topic': 'PLAYER_MOVEMENT', 'user_id': user_id, 'velocity': velocity, 'position': position},
                    user_id
                )
            elif topic == CHANGE_ROOM:
                pass
            elif topic == WIRE_PLAYER:
                pass
            elif topic == UNWIRE_PLAYER:
                pass
            # join-as-new-peer:
            # create a room if it doesnt exit and add that user to that room
            # then media server returns receive transport options to amqp
            # this should only allow to receive audio
            
            # join-as-speaker:
            # this does the same as above, except it allows
            # the user to speak, so, it returns two kinds of transport,
            # one for receiving and other for sending
            elif topic in (JOIN_AS_NEW_PEER, JOIN_AS_SPEAKER):
                room_id = payload['d']['roomId']
                payload['d']['peerId'] = user_id

                if room_id in manager.connections[world_id][room_id]:
                    if user_id not in manager.connections[world_id][room_id]:
                        manager.connections[world_id][room_id].append(user_id)
                else:
                    manager.connections[world_id][room_id] = [user_id]

                await rabbit_handler.publish(json.dumps(payload))
            elif topic in (CONNECT_TRANSPORT, GET_RECV_TRACKS, CONNECT_TRANSPORT_SEND_DONE, SEND_TRACK):
                payload['d']['peerId'] = user_id
                await rabbit_handler.publish(json.dumps(payload))
            elif topic == CLOSE_MEDIA:
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
            elif topic == TOGGLE_PRODUCER:
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
            elif topic == SPEAKING_CHANGE:
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

