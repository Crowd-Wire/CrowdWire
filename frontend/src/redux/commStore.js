import { createStore } from "redux";

const initState = {
    micId: '',
    camId: '',
    globalVolume: 100,
};


/* Action Types */
const CHANGE_MIC_ID = "CHANGE_MIC_ID";
const CHANGE_CAM_ID = "CHANGE_CAM_ID";
const CHANGE_GLOBAL_VOLUME = "CHANGE_GLOBAL_VOLUME";


/* Action Creators */

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

// action change global Volume
export const changeGlobalVolume = (globalVolume) => ({
    type: CHANGE_GLOBAL_VOLUME,
    globalVolume
});

// reducer
const reducer = (state = initState, action) => {
    switch (action.type) {
        case CHANGE_MIC_ID:
            return { ...state, micId: action.micId };
        case CHANGE_CAM_ID:
            return { ...state, camId: action.camId };
        case CHANGE_GLOBAL_VOLUME:
            return { ...state, globalVolume: action.globalVolume };
        default:
            return state;
    }
};


// store devices
const store = createStore(
    reducer,
    initState
);

export default store;