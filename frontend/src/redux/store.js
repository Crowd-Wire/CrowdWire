import gameUITypes from "consts/gameUITypes";
import { createStore } from "redux";

const initState = {
  activeUI: gameUITypes.MAP,
  micId: '',
  camId: '',
  playerPos: [0, 0]
};

/* Action Types */
const CHANGE_MIC_ID = "CHANGE_MIC_ID";
const CHANGE_CAM_ID = "CHANGE_CAM_ID";
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

// action change mic ID
export const changeMicId = (micId) => ({
  type: CHANGE_MIC_ID,
  micId
});

// action change cam ID
export const changeCamId = (camId) => ({
  type: CHANGE_CAM_ID,
  camId
});

// reducer
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


// reducer devices
const reducerDevice = (state = initState, action) => {
  switch (action.type) {
    case CHANGE_MIC_ID:
      return { ...state, micId: action.micId };
    case CHANGE_CAM_ID:
      return { ...state, camId: action.camId };
    default:
      return state;
  }
};

/* Store */
const store = createStore(
  reducer,
  initState
);

// store devices
export const storeDevice = createStore(
  reducerDevice,
  initState
);

export default store;
