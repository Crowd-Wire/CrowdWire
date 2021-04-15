import { createStore } from "redux";

const initState = {
    players: {}
};

/* Action Types */
export const JOIN_PLAYER = "JOIN_PLAYER";
export const LEAVE_PLAYER = "LEAVE_PLAYER";
export const PLAYER_MOVEMENT = "PLAYER_MOVEMENT";

/* Action Creators */
export const connectPlayer = (playerId) => ({
    type: JOIN_PLAYER,
    playerId,
    // position
    // avatar...
});

export const disconnectPlayer = (playerId) => ({
    type: LEAVE_PLAYER,
    playerId,
});

export const movePlayer = (playerId, velocity, position) => ({
    type: PLAYER_MOVEMENT,
    playerId,
    position,
    velocity
});


/* Reducer */
const reducer = (state = initState, action) => {
    let players;
    switch (action.type) {
        case JOIN_PLAYER:
            players = state.players;
            players[action.playerId] = {
                position: action.position, velocity: {x: 0, y: 0}
            };
            return { ...state, players };
        case LEAVE_PLAYER:
            players = state.players;
            delete players[action.playerId];
            console.log('no wayt')
            return { ...state, players };
        case PLAYER_MOVEMENT:
            players = state.players;
            console.log(action.playerId, players[action.playerId], players)
            players[action.playerId].position = action.position;
            players[action.playerId].velocity = action.velocity;
            return { ...state, players };
        default:
            return state;
    }
};


/* Store */
const store = createStore(
    reducer,
    initState
);


export default store;
