import React from "react";

import { connect } from "react-redux";

import gameUI from "consts/gameUI";
// import { toggleGameUI } from "redux/store";

import Phaser from "./Sections/Phaser";
import MapUI from "./Sections/MapUI";
import MapEditorUI from "./Sections/MapEditorUI";
// MapManager
// Settings


const gameUIStyle = {
  position: "absolute",
  zIndex: 2,
}

class Game extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const uiRoot = document.getElementById('uiRoot');
    for (const eventName of ['mousedown', 'mouseup']){
        uiRoot.addEventListener(eventName, e => e.stopPropagation());
    }
  }
  
  render() {
    let componentUI = <MapUI />;

    if (this.props) {
      switch(this.props.activeUI) {
        case gameUI.MAP:
          componentUI = <MapUI />;
          break;
        case gameUI.MAP_EDITOR:
          componentUI = <MapEditorUI />;
          break;
      }
    }


    return (
      <>
        {/* Game UI */}
        <div id="uiRoot">
          {React.cloneElement(
            componentUI,
            {style: gameUIStyle}
          )}
        </div>

        {/* Game */}
        <Phaser />
      </>
    );
  }
}


const mapStateToProps = (state) => ({
  ...state
});

// const mapDispatchToProps = (dispatch) => ({
//   toggleGameUI: () => dispatch(toggleGameUI),
// });

export default connect(mapStateToProps)(Game);

