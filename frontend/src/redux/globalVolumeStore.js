import { createStore } from "redux";

const initState = {
    globalVolume: 100
}

const CHANGE_GLOBAL_VOLUME = "CHANGE_GLOBAL_VOLUME";


// action change global Volume
export const changeGlobalVolume = (globalVolume) => ({
    type: CHANGE_GLOBAL_VOLUME,
    globalVolume
});


// reducer
const reducer = (state = initState, action) => {
    switch (action.type) {
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