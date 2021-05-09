import React from "react";
import { withStyles } from "@material-ui/core";

import GameDrawer from 'components/GameDrawer/GameDrawer';
import Phaser from "./Sections/Phaser.js";

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";


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

export default withStyles(styles)(GamePage);
