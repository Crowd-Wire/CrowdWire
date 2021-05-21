# user STATUS
USER_NORMAL_STATUS = 0
USER_BANNED_STATUS = 1

# world STATUS
WORLD_NORMAL_STATUS = 0
WORLD_BANNED_STATUS = 1
WORLD_DELETED_STATUS = 2

# Avatar filenames
AVATAR_1 = "avatar_1"
AVATAR_2 = "avatar_2"
AVATAR_3 = "avatar_3"

AVATARS_LIST = [AVATAR_1, AVATAR_2, AVATAR_3]


class WebsocketProtocol:
    PING = 'PING'
    PONG = 'PONG'
    SEND_MESSAGE = 'SEND_MESSAGE'
    JOIN_PLAYER = 'JOIN_PLAYER'
    LEAVE_PLAYER = 'LEAVE_PLAYER'
    JOIN_CONFERENCE = 'JOIN_CONFERENCE'
    LEAVE_CONFERENCE = 'LEAVE_CONFERENCE'
    PLAYER_MOVEMENT = 'PLAYER_MOVEMENT'
    PLAYERS_SNAPSHOT = 'PLAYERS_SNAPSHOT'
    CHANGE_ROOM = 'CHANGE_ROOM'
    WIRE_PLAYER = 'WIRE_PLAYER'
    REQUEST_TO_SPEAK = 'REQUEST_TO_SPEAK'
    PERMISSION_TO_SPEAK = 'PERMISSION_TO_SPEAK'
    GET_ROOM_USERS_FILES = 'GET_ROOM_USERS_FILES'
    REMOVE_ALL_USER_FILES = 'REMOVE_ALL_USER_FILES'
    ADD_USER_FILE = 'ADD_USER_FILE'
    REMOVE_USER_FILE = 'REMOVE_USER_FILE'
    UNWIRE_PLAYER = 'UNWIRE_PLAYER'
    JOIN_AS_NEW_PEER = 'join-as-new-peer'
    ADD_SPEAKER = 'add-speaker'
    JOIN_AS_SPEAKER = 'join-as-speaker'
    ACTIVE_SPEAKER = 'active_speaker'
    CONNECT_TRANSPORT = '@connect-transport'
    GET_RECV_TRACKS = '@get-recv-tracks'
    CONNECT_TRANSPORT_SEND_DONE = '@connect-transport-send-done'
    SEND_TRACK = '@send-track'
    SEND_FILE = '@send-file'
    CLOSE_MEDIA = 'close-media'
    TOGGLE_PRODUCER = 'toggle-producer'
    TOGGLE_PEER_PRODUCER = 'toggle-peer-producer'
    SPEAKING_CHANGE = 'speaking_change'

class RabbitProtocol:
    GET_RECV_TRACKS_DONE = '@get-recv-tracks-done'
    SEND_TRACK_SEND_DONE = '@send-track-send-done'
    SEND_FILE_SEND_DONE = '@send-file-send-done'
    CONNECT_TRANSPORT_RECV_DONE = '@connect-transport-recv-done'
    CONNECT_TRANSPORT_SEND_DONE = '@connect-transport-send-done'
    YOU_JOINED_AS_PEER = 'you-joined-as-peer'
    YOU_JOINED_AS_SPEAKER = 'you-joined-as-speaker'
    YOU_ARE_NOW_A_SPEAKER = 'you-are-now-a-speaker'
    NEW_PEER_PRODUCER = 'new-peer-producer'
    NEW_PEER_DATA_PRODUCER = 'new-peer-data-producer'
    CLOSE_CONSUMER = 'close_consumer'
    ERROR = 'error'