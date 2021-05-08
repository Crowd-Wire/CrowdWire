import React from "react";

import { withStyles } from "@material-ui/core";

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";

import Phaser from "./Sections/Phaser.js";

import GameDrawer from 'components/GameDrawer/GameDrawer.js';
import TextField from '@material-ui/core/TextField';


class GamePage extends React.Component {

  constructor(props) {
    super(props);
  }


  handleKeyDown = (event) => {
    const value = event.target.value;
    if (event.key === 'Enter' && value) {
      event.target.value = '';
    }
  }

  render() {
    const { classes } = this.props;
    
    return (
      <>
        <div className={classes.wrapper}>
          <GameDrawer />
          {/* <div style={{width: '300px', backgroundColor: '#aaa'}}>
            <TextField
              id="outlined-basic" label="Outlined" variant="outlined"
              InputLabelProps={{ shrink: false }}
              onKeyDown={this.handleKeyDown}
            />
          </div> */}
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

