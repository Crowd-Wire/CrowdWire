import React from "react";

<<<<<<< HEAD
import { connect } from "react-redux";

import gameUI from "consts/gameUI";
=======
import classNames from 'classnames';

import { connect } from "react-redux";

import gameUITypes from "consts/gameUITypes";
>>>>>>> aaeec242d2c54edef72e0dd157061f0979d18e53
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

<<<<<<< HEAD
export default connect(mapStateToProps)(Game);
=======
export default connect(mapStateToProps)(GamePage);
>>>>>>> aaeec242d2c54edef72e0dd157061f0979d18e53

