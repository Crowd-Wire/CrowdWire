import gameUITypes from "consts/gameUITypes";
import { createStore } from "redux";

<<<<<<< HEAD
const initState = {
  activeUI: gameUI.MAP,
  micId: '',
  camId: ''
};

// action types
const TOGGLE_GAME_UI = "TOGGLE_GAME_UI";
const CHANGE_MIC_ID = "CHANGE_MIC_ID";
const CHANGE_CAM_ID = "CHANGE_CAM_ID";
=======
const initState = { activeUI: gameUITypes.MAP, playerPos: [0, 0] };

/* Action Types */
export const TOGGLE_GAME_UI = "TOGGLE_GAME_UI";
export const SEND_PLAYER_POS = "SEND_PLAYER_POS";
>>>>>>> 30d423bd83c4bfb1ee08d45d9cbb6af8923c86ad


/* Action Creators */
export const toggleGameUI = (activeUI) => ({
  type: TOGGLE_GAME_UI,
  activeUI
});
export const sendPlayerPosition = (playerPos) => ({
  type: SEND_PLAYER_POS,
  playerPos
});

<<<<<<< HEAD
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
=======
/* Reducer */
>>>>>>> 30d423bd83c4bfb1ee08d45d9cbb6af8923c86ad
const reducer = (state = initState, action) => {
  switch (action.type) {
    case TOGGLE_GAME_UI:
      return { ...state, activeUI: action.activeUI };
<<<<<<< HEAD
    case CHANGE_MIC_ID:
      return { ...state, micId: action.micId };
    case CHANGE_CAM_ID:
      return { ...state, camId: action.camId };
    default:
      return state;
  }
};


// reducer
const reducerDevice = (state = initState, action) => {
  switch (action.type) {
    case CHANGE_MIC_ID:
      return { ...state, micId: action.micId };
    case CHANGE_CAM_ID:
      return { ...state, camId: action.camId };
=======
    case SEND_PLAYER_POS:
      return { ...state, playerPos: action.playerPos };
>>>>>>> 30d423bd83c4bfb1ee08d45d9cbb6af8923c86ad
    default:
      return state;
  }
};

/* Store */
const store = createStore(
  reducer,
  initState
);

// store
export const storeDevice = createStore(
  reducerDevice,
  initState
);

export default store;