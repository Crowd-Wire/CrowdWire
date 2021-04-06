import gameUITypes from "consts/gameUITypes";
import { createStore } from "redux";

const initState = { activeUI: gameUITypes.MAP, playerPos: [0, 0] };

/* Action Types */
export const TOGGLE_GAME_UI = "TOGGLE_GAME_UI";
export const SEND_PLAYER_POS = "SEND_PLAYER_POS";


/* Action Creators */
export const toggleGameUI = (activeUI) => ({
  type: TOGGLE_GAME_UI,
  activeUI
});
export const sendPlayerPosition = (playerPos) => ({
  type: SEND_PLAYER_POS,
  playerPos
});

/* Reducer */
const reducer = (state = initState, action) => {
  switch (action.type) {
    case TOGGLE_GAME_UI:
      return { ...state, activeUI: action.activeUI };
    case SEND_PLAYER_POS:
      return { ...state, playerPos: action.playerPos };
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