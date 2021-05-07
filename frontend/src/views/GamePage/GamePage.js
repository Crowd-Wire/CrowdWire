import React from "react";

import { withStyles } from "@material-ui/core";

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";

import Phaser from "./Sections/Phaser.js";

import DashDrawer from 'components/DashDrawer/DashDrawer.js';

class GamePage extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    
    return (
      <>
        <div className={classes.wrapper}>
            <DashDrawer></DashDrawer>
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

