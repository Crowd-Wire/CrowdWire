import React, {useState} from "react";
import { withStyles } from "@material-ui/core";

import GameDrawer from 'components/GameDrawer/GameDrawer';
import Phaser from "./Sections/Phaser.js";

import { FullScreen, useFullScreenHandle } from "react-full-screen";
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";


const GamePage = (props) => {

  const { classes } = props;
  const handle = useFullScreenHandle();
  const [fullScreen, setFullscreen] = useState(false)

  const style = {
    position: 'absolute',
    top: 0, 
    right: 0, 
    fontSize: '2.5rem',
    cursor: 'pointer',
    zIndex: 100
  }

  document.addEventListener('fullscreenchange', (event) => {
    if (document.fullscreenElement) {
      // entered full-screen mode
      setFullscreen(true);
    } else {
      setFullscreen(false);
    }
  })

  const handleFullscreen = () => {
    if (!fullScreen) {
      handle.enter()
    } else {
      handle.exit()
    }
  }

  return (
    <>
      <FullScreen handle={handle}>
        <div className={classes.wrapper}>
          <GameDrawer />
          <div className={classes.gameWindow}>
            {/* Game */}
            <Phaser />
          </div>
          {
            fullScreen ?
            <FullscreenExitIcon style={style} onClick={handleFullscreen} />
            : <FullscreenIcon style={style} onClick={handleFullscreen} />
          }
        </div>
      </FullScreen>
    </>
  );
}

export default withStyles(styles)(GamePage);
