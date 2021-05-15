import React, {useState, useEffect} from "react";
import { withStyles } from "@material-ui/core";

import GameDrawer from 'components/GameDrawer/GameDrawer';
import Phaser from "./Sections/Phaser.js";

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";
import WorldService from "../../services/WorldService";
import { toast } from 'react-toastify';
import logo from '../../assets/crowdwire_white_logo.png';
import useWorldUserStore from '../../stores/useWorldUserStore';

const GamePage = (props) => {

  const { classes } = props;
  const [loading, setLoading] = useState(1)

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
        <div className={classes.wrapper}>
          <GameDrawer />
          <div className={classes.gameWindow}>
            {/* Game */}
            <Phaser />
          </div>
        </div>
      }
    </>
  );
}

export default withStyles(styles)(GamePage);
