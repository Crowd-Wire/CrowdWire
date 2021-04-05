import gameUI from "consts/gameUI";
import { createStore } from "redux";

const initState = {
  activeUI: gameUI.MAP,
  micID: '' 
};

// action types
const TOGGLE_GAME_UI = "TOGGLE_GAME_UI";
const CHANGE_MIC_ID = "CHANGE_MIC_ID";

// action creators
export const toggleGameUI = (activeUI) => ({
  type: TOGGLE_GAME_UI,
  activeUI
});

// action change mic ID
export const changeMicID = (micID) => ({
  type: CHANGE_MIC_ID,
  micID
});

// reducer
const reducer = (state = initState, action) => {
  switch (action.type) {
    case TOGGLE_GAME_UI:
      return { ...state, activeUI: action.activeUI };
    case CHANGE_MIC_ID:
      return { ...state, micID: action.micID };
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