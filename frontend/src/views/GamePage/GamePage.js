import React, { useState, useEffect } from "react";
import { withStyles } from "@material-ui/core";
import classNames from "classnames";

import GameDrawer from 'components/GameDrawer/GameDrawer';
import Phaser from "./Sections/Phaser.js";

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";
import WorldService from "../../services/WorldService.ts";
import { toast } from 'react-toastify';
import logo from '../../assets/crowdwire_white_logo.png';
import interact from 'assets/img/interact.png';
import move from 'assets/img/move.png';
import useWorldUserStore from '../../stores/useWorldUserStore';
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../services/socket.js";
import Carousel from 'components/AvatarCarousel/AvatarCarousel.js';
import TextField from '@material-ui/core/TextField';
import RoomCall from "./../../components/Communications/RoomCall";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PersonIcon from '@material-ui/icons/Person';
import { Card } from '@material-ui/core';
import Button from "components/CustomButtons/Button.js";
import CardBody from "components/Card/CardBody.js";
import Select from '@material-ui/core/Select';
import useAuthStore from "stores/useAuthStore";
import usePlayerStore from "stores/usePlayerStore";
import { useWsHandlerStore } from "webrtc/stores/useWsHandlerStore";

const GamePage = (props) => {

  const { classes } = props;
  const [loading, setLoading] = useState(1);
  const navigation = useNavigate();
  const [choosingSettings, setChoosingSettings] = useState(true);
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState("avatars_1_1")
  let connecting = usePlayerStore(state => state.connecting);
  let reconnect = null;

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
    useAuthStore.getState().setLastLocation(null);
    WorldService.joinWorld(window.location.pathname.split('/')[2])
      .then((res) => {
        return res.json();
      }).then(
        (res) => {
          if (res.detail) {
            toast.error(
              <span>
                <img src={logo} style={{ height: 22, width: 22, display: "block", float: "left", paddingRight: 3 }} />
                {res.detail}
              </span>
              , toast_props);
            navigation("/dashboard/search/public");
          }
          else {
            useWsHandlerStore.getState().addWsListener(`KICKED`, (d) => {
              toast.error(
                <span>
                  <img src={logo} style={{ height: 22, width: 22, display: "block", float: "left", paddingRight: 3 }} />
                  {d.reason}
                </span>
                , toast_props);
              if (useWorldUserStore.getState().world_user) {
                getSocket(useWorldUserStore.getState().world_user.world_id).socket.close();
              }
              navigation("/dashboard/search/public");
            })
            useWorldUserStore.getState().joinWorld(res);
            setUsername(res.username)
            setAvatar(res.avatar)
            setLoading(0);
          }
        }
      ).catch(() => {
        navigation("/dashboard/search/public");
      })

  }, [])

  useEffect(() => {
    usePlayerStore.getState().setConnecting(false);
    // close socket on component unmount
    return () => {
      if (useWorldUserStore.getState().world_user) {
        getSocket(useWorldUserStore.getState().world_user.world_id).socket.close();
      }
      if (reconnect) {
        clearInterval(reconnect);
        reconnect = null;
      }
      usePlayerStore.getState().setConnecting(false);
    }
  }, [])

  const updateWorldUser = () => {
    let user_username = document.getElementById("world_user_username").value;
    if (user_username === "") {
      user_username = username;
    }
    WorldService.updateWorldUser(
      window.location.pathname.split('/')[2],
      useWorldUserStore.getState().world_user.user_id,
      avatar,
      user_username
    )
      .then((res) => {
        if (res.ok) return res.json();
        navigation("/dashboard/search/public");
      }).then(
        (res) => {
          if (res) {
            if (res.detail) {
              toast.dark(
                <span>
                  <img src={logo} style={{ height: 22, width: 22, display: "block", float: "left", paddingRight: 3 }} />
                  {res.detail}
                </span>
                , toast_props);
              navigation("/dashboard/search/public");
            }
            else {
              useWorldUserStore.getState().updateWorldUserAvatarUsername(res.avatar, res.username)
              setChoosingSettings(false)
              setLoading(0);
            }
          }
        }
      )
  }

  useEffect(() => {
    if (connecting && !reconnect) {
      reconnect = setInterval(() => {
        let socket = getSocket(useWorldUserStore.getState().world_user.world_id).socket
        if (socket && socket.readyState === 1) {
          clearInterval(reconnect);
          reconnect = null;
          usePlayerStore.getState().setConnecting(false);
        }
      }, 5000);
    }
  }, [connecting])

  return (
    <>
      {loading ?
        (
          <div className={classes.backgroundGradient}></div>
        )
        : connecting ?
          (
            <div className={classes.backgroundGradient}>
              <div className={classNames(classes.center, classes.info)}>
                <img src={logo} className={classes.loader} alt="" />
                <br />
                Reconnecting...
              </div>
            </div>
          )
          : choosingSettings ?
            (
              <div className={classes.backgroundGradient}>
                <div className={classes.center}>
                  <img src={move} className={classes.img} />
                  <Card className={classes.card} style={{
                    minWidth: 400,
                    padding: 3,
                    background: 'rgba(255, 255, 255, 0.8)',
                    overflow: 'hidden',
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
                    borderTop: '1px solid rgba(255,255,255,0.5)',
                    borderLeft: '1px solid rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(3px)',
                    borderRadius: '5%',
                  }}>
                    <CardBody>
                      <div style={{ textAlign: 'center' }}>
                        <h3 style={{ color: '#3f51b5' }}><PersonIcon />My World User Profile</h3>
                      </div>
                      <Row sm={12}>
                        <Col style={{ textAlign: 'center', paddingBottom: 10 }}>
                          <Select
                            native
                            className="MuiTypography-root MuiTypography-body1"
                            style={{ fontWeight: 700, color: "rgb(63, 81, 181)", background: 'transparent', border: 0, marginLeft: "auto", marginTop: "10px" }}
                            inputProps={{
                              id: 'world_user_avatar',
                            }}
                            defaultValue={avatar}
                            onChange={(event, value) => { setAvatar(event.target.value) }}
                          >
                            <option value={'avatars_1_1'}>Sim??o</option>
                            <option value={'avatars_1_2'}>Leandro</option>
                            <option value={'avatars_1_3'}>Lionel</option>
                            <option value={'avatars_1_4'}>Leonardo</option>
                            <option value={'avatars_1_5'}>Rita</option>
                            <option value={'avatars_1_6'}>Sasha</option>
                            <option value={'avatars_1_7'}>Carolina</option>
                            <option value={'avatars_1_8'}>J??ssica</option>
                            <option value={'avatars_2_1'}>Duarte</option>
                            <option value={'avatars_2_2'}>Ana</option>
                            <option value={'avatars_2_3'}>Tiago</option>
                            <option value={'avatars_2_4'}>Sandra</option>
                            <option value={'avatars_2_5'}>Rui</option>
                            <option value={'avatars_2_6'}>Clara</option>
                            <option value={'avatars_2_7'}>Edu</option>
                            <option value={'avatars_2_8'}>Eduarda</option>
                            <option value={'avatars_3_1'}>Carlos</option>
                            <option value={'avatars_3_2'}>Marcos</option>
                            <option value={'avatars_3_3'}>Samuel</option>
                            <option value={'avatars_3_4'}>Teixeira</option>
                            <option value={'avatars_3_5'}>Filipe</option>
                            <option value={'avatars_3_6'}>Rodrigo</option>
                            <option value={'avatars_3_7'}>Andr??</option>
                            <option value={'avatars_3_8'}>Fernando</option>
                            <option value={'avatars_4_1'}>Marta</option>
                            <option value={'avatars_4_2'}>Andreia</option>
                            <option value={'avatars_4_5'}>Isabela</option>
                            <option value={'avatars_4_6'}>Ricardo</option>
                          </Select>
                        </Col>
                      </Row>
                      <Row sm={12}>
                        <Col style={{ textAlign: 'center' }}>
                          <Carousel avatar={avatar} />
                        </Col>
                      </Row>
                      <Row sm={12} style={{ paddingTop: 30 }}>
                        <TextField style={{ marginLeft: "auto", marginRight: "auto" }} defaultValue={username} id="world_user_username" label="username" variant="outlined" />
                      </Row>
                      <div style={{ textAlign: "center", paddingTop: 50 }}>
                        <Button color="success" size="md" round onClick={() => updateWorldUser()}>
                          <span style={{ fontWeight: 600, fontSize: '1rem' }}>Enter</span>
                        </Button>
                        <Button color="danger" size="md" round simple onClick={() => updateWorldUser()}>
                          <span style={{ fontWeight: 600, fontSize: '1rem' }} onClick={() => navigation("/dashboard/search/public")}>Leave</span>
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                  <img src={interact} className={classes.img} />
                </div>
              </div>
            )
            :
            (
              <div className={classes.wrapper}>
                <GameDrawer />
                <div className={classes.gameWindow}>
                  {/* Game */}
                  <RoomCall />
                  <Phaser scene='GameScene' />
                </div>
              </div>
            )
      }
    </>
  );
}

export default withStyles(styles)(GamePage);
