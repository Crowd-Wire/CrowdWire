import React, {useState, useEffect} from "react";
import { withStyles } from "@material-ui/core";

import GameDrawer from 'components/GameDrawer/GameDrawer';
import Phaser from "./Sections/Phaser.js";

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";
import WorldService from "../../services/WorldService";
import { toast } from 'react-toastify';
import logo from '../../assets/crowdwire_white_logo.png';
import useWorldUserStore from '../../stores/useWorldUserStore';
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../services/socket.js";

import RoomCall from "./../../components/Communications/RoomCall";


const GamePage = (props) => {

  const { classes } = props;
  const [loading, setLoading] = useState(1)
  const navigation = useNavigate();

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
    WorldService.joinWorld(window.location.pathname.split('/')[2])
    .then((res) => {
      if (res.ok) return res.json()
      navigation("/dashboard/search/public");
    }).then(
      (res) => {
        if (res.detail){
          toast.dark(
            <span>
              <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
              {res.detail}
            </span>
          ,toast_props);
          navigation("/dashboard/search/public");
        }
        else {
          useWorldUserStore.getState().joinWorld(res);
          setLoading(0);
        }
      }
    ).catch(() => 
      navigation("/dashboard/search/public")
    )
  }, [])

  useEffect(() => {
      // close socket on component unmount
      return () => {
        if (useWorldUserStore.getState().world_user) getSocket(useWorldUserStore.getState().world_user.world_id).socket.close();
      }
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
            <RoomCall />
            <Phaser scene='GameScene' />
          </div>
        </div>
      }
    </>
  );
}

export default withStyles(styles)(GamePage);
