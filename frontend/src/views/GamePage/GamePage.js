import React from "react";

import { withStyles } from "@material-ui/core";

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";

import Phaser from "./Sections/Phaser.js";

import GameDrawer from 'components/GameDrawer/GameDrawer.js';

class GamePage extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    
    return (
      <>
        <div className={classes.wrapper}>
            <GameDrawer />
          <div  className={classes.gameWindow}>
            {/* Game */}
            <Phaser />
          </div>
        </div>
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

export default withStyles(styles)(GamePage);

