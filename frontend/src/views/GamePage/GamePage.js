import React, {useState, useEffect} from "react";
import { withStyles } from "@material-ui/core";

import GameDrawer from 'components/GameDrawer/GameDrawer';
import Phaser from "./Sections/Phaser.js";

import styles from "assets/jss/my-kit-react/views/gamePageStyle.js";
import WorldService from "../../services/WorldService.ts";
import { toast } from 'react-toastify';
import logo from '../../assets/crowdwire_white_logo.png';
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
import { useWsHandlerStore } from "webrtc/stores/useWsHandlerStore";

const GamePage = (props) => {

  const { classes } = props;
  const [loading, setLoading] = useState(1)
  const navigation = useNavigate();
  const [choosingSettings, setChoosingSettings] = useState(true)
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState("avatars_1_1")

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
    useAuthStore.getState().setLastLocation(null)
    WorldService.joinWorld(window.location.pathname.split('/')[2])
    .then((res) => {
      return res.json()
    }).then(
      (res) => {
        console.log(res.detail)

        if (res.detail){
          console.log("")
          toast.error(
            <span>
              <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
              {res.detail}
            </span>
          ,toast_props);
          navigation("/dashboard/search/public");
        }
        else {
          useWsHandlerStore.getState().addWsListener(`KICKED`, (d) => {
            console.log("ODSADAS")
            console.log(d.reason)
            toast.error(
              <span>
                <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
                {d.reason}
              </span>
            ,toast_props);
            if (useWorldUserStore.getState().world_user) getSocket(useWorldUserStore.getState().world_user.world_id).socket.close();
            navigation("/dashboard/search/public");
          })
          useWorldUserStore.getState().joinWorld(res);
          setUsername(res.username)
          setLoading(0);
        }
      }
    ).catch(() => {
      console.log("AONDE TOU CRL")
      navigation("/dashboard/search/public")
    }
    )

  }, [])

  useEffect(() => {
      // close socket on component unmount
      return () => {
        if (useWorldUserStore.getState().world_user) getSocket(useWorldUserStore.getState().world_user.world_id).socket.close();
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
        if (res.ok) return res.json()
        navigation("/dashboard/search/public");
      }).then(
        (res) => {
          if (res) {
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
              useWorldUserStore.getState().updateWorldUserAvatarUsername(res.avatar, res.username)
              setChoosingSettings(false)
              setLoading(0);
            }
          }
        }
      )
  }
  
  return (
    <>
      {loading ? 
        ''
      : 
        choosingSettings ?
          (
            <div style={{
              height: '100%',
              width: '100%',
              backgroundColor: '#2B9BFD',
              backgroundImage: 'linear-gradient(to bottom right, #2B9BFD 4%, #71d1b9 90%)'
            }}>
              <div style={{
                position: 'fixed',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <Card style={{
                  height: '50%',
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
                    <div style={{textAlign: 'center'}}>
                      <h3 style={{color: '#3f51b5'}}><PersonIcon/>My World User Profile</h3>
                    </div>
                    <Row sm={12}>
                      <Col style={{textAlign: 'center', paddingBottom: 10}}>
                        <Select
                          native
                          className="MuiTypography-root MuiTypography-body1"
                          style={{fontWeight: 700, color: "rgb(63, 81, 181)", background: 'transparent', border: 0, marginLeft:"auto", marginTop:"10px"}}
                          inputProps={{
                            id: 'world_user_avatar',
                          }}
                          defaultValue={avatar}
                          onChange={(event, value) => {setAvatar(event.target.value)}}
                          >
                          <option value={'avatars_1_1'}>Avatar 1</option>
                          <option value={'avatars_1_2'}>Leandro</option>
                          <option value={'avatars_1_3'}>Lionel</option>
                          <option value={'avatars_1_4'}>Leonardo</option>
                          <option value={'avatars_1_5'}>BSS</option>
                          <option value={'avatars_1_6'}>Sasha</option>
                          <option value={'avatars_1_7'}>Avatar 7</option>
                          <option value={'avatars_1_8'}>Avatar 8</option>
                          <option value={'avatars_2_1'}>Avatar 9</option>
                          <option value={'avatars_2_2'}>Avatar 10</option>
                          <option value={'avatars_2_3'}>Avatar 11</option>
                          <option value={'avatars_2_4'}>Avatar 12</option>
                          <option value={'avatars_2_5'}>Avatar 12</option>
                          <option value={'avatars_2_6'}>Avatar 13</option>
                          <option value={'avatars_2_7'}>Edu</option>
                          <option value={'avatars_2_8'}>Eduarda</option>
                          <option value={'avatars_3_1'}>Avatar 16</option>
                          <option value={'avatars_3_2'}>Avatar 17</option>
                          <option value={'avatars_3_3'}>Avatar 18</option>
                          <option value={'avatars_3_4'}>Teixeira</option>
                          <option value={'avatars_3_5'}>Avatar 20</option>
                          <option value={'avatars_3_6'}>Avatar 21</option>
                          <option value={'avatars_3_7'}>Avatar 22</option>
                          <option value={'avatars_3_8'}>Avatar 23</option>
                          <option value={'avatars_4_1'}>Avatar 24</option>
                          <option value={'avatars_4_2'}>Avatar 25</option>
                          <option value={'avatars_4_5'}>Avatar 26</option>
                          <option value={'avatars_4_6'}>Avatar 27</option>
                        </Select>
                      </Col>
                    </Row>
                    <Row sm={12}>
                      <Col style={{textAlign: 'center'}}>
                        <Carousel avatar={avatar} />
                      </Col>
                    </Row>
                    <Row sm={12} style={{paddingTop: 30}}>
                      <TextField style={{marginLeft:"auto", marginRight:"auto"}} defaultValue={username} id="world_user_username" label="username" variant="outlined" />
                    </Row>
                    <div style={{textAlign: "center", paddingTop: 50}}>
                    <Button color="success" size="md" round onClick={() => updateWorldUser()}>
												<span style={{fontWeight: 600, fontSize: '1rem'}}>Enter</span>
											</Button>
                    </div>
                  </CardBody>
                </Card>
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
