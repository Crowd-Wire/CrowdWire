import React, {useState, useEffect} from "react";
import { withStyles } from "@material-ui/core";

import GameDrawer from 'components/GameDrawer/GameDrawer';
import Phaser from "./Sections/Phaser.js";

import { FullScreen, useFullScreenHandle } from "react-full-screen";
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";
import WorldService from "../../services/WorldService";
import { toast } from 'react-toastify';
import logo from '../../assets/crowdwire_white_logo.png';
import useWorldUserStore from '../../stores/useWorldUserStore';

const GamePage = (props) => {

  const { classes } = props;
  const handle = useFullScreenHandle();
  const [fullScreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(1)

  const style = {
    position: 'absolute',
    top: 0, 
    right: 0, 
    fontSize: '2.5rem',
    cursor: 'pointer',
    zIndex: 100
  }

  const toast_props = {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true,
    pauseOnFocusLoss: false,
    pauseOnHover: false,
    progress: undefined,
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

  useEffect(() => {
    WorldService.join_world(1)
    .then((res) => res.json())
    .then(
      (res) => {
        console.log(res)
        if(res.detail){
          toast.dark(
            <span>
              <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
              {res.detail}
            </span>
          ,toast_props);
        }
        else {
          useWorldUserStore.getState().joinWorld(res);
          console.log(useWorldUserStore.getState());
          setLoading(0);
        }
      }
    )
  }, [])
  
  return (
    <>
      {loading ? 
        ''
      : 
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
      }
    </>
  );
}

export default withStyles(styles)(GamePage);
