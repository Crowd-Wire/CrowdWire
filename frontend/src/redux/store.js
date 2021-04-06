import gameUI from "consts/gameUI";
import { createStore } from "redux";

const initState = {
  activeUI: gameUI.MAP,
  micId: '',
  camId: ''
};

// action types
const TOGGLE_GAME_UI = "TOGGLE_GAME_UI";
const CHANGE_MIC_ID = "CHANGE_MIC_ID";
const CHANGE_CAM_ID = "CHANGE_CAM_ID";

// action creators
export const toggleGameUI = (activeUI) => ({
  type: TOGGLE_GAME_UI,
  activeUI
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
    default:
      return state;
  }
};

// store
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