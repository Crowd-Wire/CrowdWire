import React from "react";
import { withStyles } from "@material-ui/core";

import GameDrawer from 'components/GameDrawer/GameDrawer';
import Phaser from "./Sections/Phaser.js";

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";
import WorldService from "../../services/WorldService";

class GamePage extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount(){

    let world_id = parseInt(window.location.pathname.split("/")[2]);

    if(!isNaN(world_id)){
      // if it is a number
      WorldService.join_world(world_id)
      .then((res) => {return res.json()})
      .then( (res) => {
          // returns the role, username, avatar and the map.
          console.log(res);
      })
    }

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
