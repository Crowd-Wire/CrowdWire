import gameUITypes from "consts/gameUITypes";
import { createStore } from "redux";

const initState = { activeUI: gameUITypes.MAP };

// action types
const TOGGLE_GAME_UI = "TOGGLE_GAME_UI";

// action creators
export const toggleGameUI = (activeUI) => ({
  type: TOGGLE_GAME_UI,
  activeUI
});

// reducer
const reducer = (state = initState, action) => {
  switch (action.type) {
    case TOGGLE_GAME_UI:
      return { ...state, activeUI: action.activeUI };
    default:
      return state;
  }
};

// store
const store = createStore(
  reducer,
  initState
);

export default store;