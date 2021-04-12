import gameUITypes from "consts/gameUITypes";
import { createStore } from "redux";

const initState = {
    activeUI: gameUITypes.MAP,
};

/* Action Types */
export const TOGGLE_GAME_UI = "TOGGLE_GAME_UI";

/* Action Creators */
export const toggleGameUI = (activeUI) => ({
    type: TOGGLE_GAME_UI,
    activeUI
});


/* Reducer */
const reducer = (state = initState, action) => {
    switch (action.type) {
        case TOGGLE_GAME_UI:
            return { ...state, activeUI: action.activeUI };
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
