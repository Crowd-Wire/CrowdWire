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
    JOIN_PLAYER = 'JOIN_PLAYER'
    PLAYER_MOVEMENT = 'PLAYER_MOVEMENT'
    CHANGE_ROOM = 'CHANGE_ROOM'
    WIRE_PLAYER = 'WIRE_PLAYER'
    UNWIRE_PLAYER = 'UNWIRE_PLAYER'
    JOIN_AS_NEW_PEER = 'join-as-new-peer'
    JOIN_AS_SPEAKER = 'join-as-speaker'
    ACTIVE_SPEAKER = 'active_speaker'
    CONNECT_TRANSPORT = '@connect-transport'
    GET_RECV_TRACKS = '@get-recv-tracks'
    CONNECT_TRANSPORT_SEND_DONE = '@connect-transport-send-done'
    SEND_TRACK = '@send-track'
    CLOSE_MEDIA = 'close-media'
    TOGGLE_PRODUCER = 'toggle-producer'
    TOGGLE_PEER_PRODUCER = 'toggle-peer-producer'
    SPEAKING_CHANGE = 'speaking_change'
