# user STATUS
USER_NORMAL_STATUS = 0
USER_BANNED_STATUS = 1
USER_DELETE_STATUS = 2
USER_PENDING_STATUS = 3

# world STATUS
WORLD_NORMAL_STATUS = 0
WORLD_BANNED_STATUS = 1
WORLD_DELETED_STATUS = 2

# Avatar filenames
AVATAR_1_1 = "avatars_1_1"
AVATAR_1_2 = "avatars_1_2"
AVATAR_1_3 = "avatars_1_3"
AVATAR_1_4 = "avatars_1_4"
AVATAR_1_5 = "avatars_1_5"
AVATAR_1_6 = "avatars_1_6"
AVATAR_1_7 = "avatars_1_7"
AVATAR_1_8 = "avatars_1_8"

AVATAR_2_1 = "avatars_2_1"
AVATAR_2_2 = "avatars_2_2"
AVATAR_2_3 = "avatars_2_3"
AVATAR_2_4 = "avatars_2_4"
AVATAR_2_5 = "avatars_2_5"
AVATAR_2_6 = "avatars_2_6"
AVATAR_2_7 = "avatars_2_7"
AVATAR_2_8 = "avatars_2_8"

AVATAR_3_1 = "avatars_3_1"
AVATAR_3_2 = "avatars_3_2"
AVATAR_3_3 = "avatars_3_3"
AVATAR_3_4 = "avatars_3_4"
AVATAR_3_5 = "avatars_3_5"
AVATAR_3_6 = "avatars_3_6"
AVATAR_3_7 = "avatars_3_7"
AVATAR_3_8 = "avatars_3_8"

AVATAR_4_1 = "avatars_4_1"
AVATAR_4_2 = "avatars_4_2"
AVATAR_4_5 = "avatars_4_5"
AVATAR_4_6 = "avatars_4_6"

AVATARS_LIST = [AVATAR_1_1, AVATAR_1_2, AVATAR_1_3, AVATAR_1_4, AVATAR_1_5, AVATAR_1_6, AVATAR_1_7, AVATAR_1_8,
                AVATAR_2_1, AVATAR_2_2, AVATAR_2_3, AVATAR_2_4, AVATAR_2_5, AVATAR_2_6, AVATAR_2_7, AVATAR_2_8,
                AVATAR_3_1, AVATAR_3_2, AVATAR_3_3, AVATAR_3_4, AVATAR_3_5, AVATAR_3_6, AVATAR_3_7, AVATAR_3_8,
                AVATAR_4_1, AVATAR_4_2, AVATAR_4_5, AVATAR_4_6]

# Role default permissions
role_default_permissions = ['talk', 'walk', 'chat']


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
    DOWNLOAD_REQUEST = 'DOWNLOAD_REQUEST'
    DENY_DOWNLOAD_REQUEST = 'DENY_DOWNLOAD_REQUEST'
    ADD_USER_FILES = 'ADD_USER_FILES'
    ACCEPT_DOWNLOAD_REQUEST = 'ACCEPT_DOWNLOAD_REQUEST'
    START_DOWNLOAD = 'START_DOWNLOAD'
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
    KICKED = 'KICKED'
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
    CREATE_NEW_REPLICA = 'CREATE_NEW_REPLICA'
