import React from "react";

import classNames from 'classnames';

import { connect } from "react-redux";

import gameUITypes from "consts/gameUITypes";
// import { toggleGameUI } from "redux/store";

import Phaser from "./Sections/Phaser";
import MapUI from "./Sections/MapUI";
import MapEditorUI from "./Sections/MapEditorUI";
import RoomCall from "../../components/Communications/RoomCall";
// MapManager
// Settings


const gameUIStyle = {
  position: "absolute",
  zIndex: 2,
}


class GamePage extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    let componentUI = <MapUI />;

    if (this.props) {
      switch (this.props.activeUI) {
        case gameUITypes.MAP:
          componentUI = <MapUI />;
          break;
        case gameUITypes.MAP_EDITOR:
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
        <div style={{position: 'absolute', zIndex: 99, height: 410}}>
          <RoomCall/>
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

export default connect(mapStateToProps)(GamePage);

