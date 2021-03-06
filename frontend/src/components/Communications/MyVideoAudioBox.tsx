import React, { useEffect, useState, useRef } from "react";

import { Card } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import SettingsIcon from '@material-ui/icons/SettingsApplicationsTwoTone';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import { wsend } from "../../services/socket.js";
import { sendMedia } from "../../webrtc/utils/sendMedia";
import { DeviceSettings } from "./DeviceSettings";
import { FileSharing } from "./FileSharing";
import { useMediaStore } from "../../webrtc/stores/useMediaStore";
import { useRoomStore } from "../../webrtc/stores/useRoomStore";
import { useMuteStore } from "../../webrtc/stores/useMuteStore";
import { useConsumerStore } from "../../webrtc/stores/useConsumerStore";
import useWorldUserStore from "../../stores/useWorldUserStore";
import { toast } from 'react-toastify';
import logo from '../../assets/crowdwire_white_logo.png';
import { useWsHandlerStore } from "../../webrtc/stores/useWsHandlerStore";
import Button from "@material-ui/core/Button";
import usePlayerStore from 'stores/usePlayerStore';
import { API_BASE } from "config";


interface MyVideoAudioBoxProps {
  username?: string;
  id: string;
  avatar?: string;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
}

export const MyVideoAudioBox: React.FC<MyVideoAudioBoxProps> = ({
  username = "anonymous", id,
  audioTrack = null, videoTrack = null,
  avatar = API_BASE + "static/characters/avatars_1_1.png"
}) => {
  const myRef = useRef<any>(null);
  const [videoPauseState, setVideoPauseState] = useState(true);
  const [audioPauseState, setAudioPauseState] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const showFileSharing = useWorldUserStore(state => state.showFileSharing);
  const showMedia = useWorldUserStore(state => state.showMedia);
  const [fullscreen, setFullscreen] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const handle = useFullScreenHandle();
  const in_conference = useWorldUserStore(state => state.world_user.in_conference);
  const [allowed_to_speak, setAllowedToSpeak] = useState(useWorldUserStore.getState().world_user.role.talk_conference);

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

  const requestToSpeak = () => {
    setHasRequested(true);
    if (useWorldUserStore.getState().world_user.in_conference) {
      wsend({ topic: "REQUEST_TO_SPEAK", 'conference': useWorldUserStore.getState().world_user.in_conference });
    }
  }

  const handleRequestToSpeak = (user_id: any, permit: boolean, toast_id: any) => {
    usePlayerStore.getState().setRequested(user_id, false)
    if (useWorldUserStore.getState().world_user.in_conference) {
      wsend({ topic: "PERMISSION_TO_SPEAK", 'conference': useWorldUserStore.getState().world_user.in_conference, 'permission': permit, 'user_requested': user_id });
    }
    toast.dismiss(toast_id);
  }

  useEffect(() => {
    if (!showFileSharing) {
      wsend({ topic: "REMOVE_ALL_USER_FILES" });
      useConsumerStore.getState().closeDataConsumers();
    }
  }, [showFileSharing])

  useEffect(() => {
    if (showMedia && !useMediaStore.getState().media) {
      sendMedia(true);
    }
  }, [showMedia])

  useEffect(() => {
    useWsHandlerStore.getState().addWsListener(`REQUEST_TO_SPEAK`, (d) => {
      let username = d.user_requested;
      if (d.user_requested in usePlayerStore.getState().users_info) {
        username = usePlayerStore.getState().users_info[d.user_requested]?.username;
      }
      usePlayerStore.getState().setRequested(d.user_requested, true)
      toast.info(
        <span>
          <p>
            <img src={logo} style={{ height: 22, width: 22, display: "block", float: "left", paddingRight: 3 }} />
            The User {username} Requested To Speak
          </p>
          <Button onClick={() => handleRequestToSpeak(d.user_requested, true, "customId" + d.user_requested)}>Accept</Button>
          <Button onClick={() => handleRequestToSpeak(d.user_requested, false, "customId" + d.user_requested)}>Deny</Button>
        </span>
        , {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 60000,
          hideProgressBar: false,
          closeOnClick: false,
          draggable: true,
          progress: undefined,
          toastId: "customId" + d.user_requested
        }
      );
    })

    useWsHandlerStore.getState().addWsListener(`PERMISSION_TO_SPEAK`, (d) => {
      toast.info(
        <span>
          <img src={logo} style={{ height: 22, width: 22, display: "block", float: "left", paddingRight: 3 }} />
          Permission to Speak {d.permission ? 'Granted' : 'Denied'}
        </span>
        , {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
        }
      );
      if (d.permission) setAllowedToSpeak(d.permission)
    })
  }, [])

  useEffect(() => {
    if (in_conference) {
      if (!allowed_to_speak) {
        toast.dark(
          <span>
            <img src={logo} style={{ height: 22, width: 22, display: "block", float: "left", paddingRight: 3 }} />
            Press the ??? Near Your Video Box to Request to Speak
          </span>
          , toast_props
        );
      }
    } else {
      setHasRequested(false)
      setAllowedToSpeak(useWorldUserStore.getState().world_user.role.talk_conference)
    };
    
  }, [in_conference])

  useEffect(() => {
    if (in_conference && !allowed_to_speak) {
      toast.dark(
        <span>
          <img src={logo} style={{ height: 22, width: 22, display: "block", float: "left", paddingRight: 3 }} />
          Press the ??? Near Your Video Box to Request to Speak
        </span>
        , toast_props);
    }
  }, [allowed_to_speak])

  function toggleModal() {
    setShowModal(!showModal)
  }

  const handleFullscreen = () => {
    if (!fullscreen) {
      handle.enter()
    } else {
      handle.exit()
    }
    setFullscreen(!fullscreen);
  }


  const toggleVideo = () => {
    setVideoPauseState(!videoPauseState)
    useMuteStore.getState().setVideoMute(videoPauseState);
    let { rooms } = useRoomStore.getState();
    if (Object.keys(rooms).length > 0) {
      for (const [key, value] of Object.entries(rooms)) {
        if (value.camProducer) {
          if (videoPauseState) { value.camProducer.pause(); }
          else { value.camProducer.resume(); }
        }
      }
    }
    wsend({ topic: "toggle-producer", d: { kind: 'video', pause: videoPauseState } })
  }
  const toggleAudio = () => {
    setAudioPauseState(!audioPauseState)
    useMuteStore.getState().setAudioMute(audioPauseState)

    let { rooms } = useRoomStore.getState();
    if (Object.keys(rooms).length > 0) {
      for (const [key, value] of Object.entries(rooms)) {
        if (value.micProducer) {
          if (audioPauseState) { value.micProducer.pause(); }
          else { value.micProducer.resume(); }
        }
      }
    }

    wsend({ topic: "toggle-producer", d: { kind: 'audio', pause: audioPauseState } });
  }

  useEffect(() => {
    setVideoPauseState(videoTrack ? true : false)
    setAudioPauseState(audioTrack ? true : false)
    const { videoMuted, audioMuted } = useMuteStore.getState();

    const mediaStream = new MediaStream();

    if (videoTrack && !videoMuted) {
      mediaStream.addTrack(videoTrack);
    }

    if (audioTrack && !audioMuted) {
      mediaStream.addTrack(audioTrack);
    }

    if (myRef.current) {
      myRef.current.srcObject = mediaStream;
      myRef.current.muted = true
    }
  }, [videoTrack, audioTrack])

  return (

    <div
      style={{
        height: '100%',
        maxWidth: 400,
        minWidth: 160,
        minHeight: 120,
        width: '100%',
        overflow: 'auto',
      }}>

      <FullScreen handle={handle}>
        <Card style={{
          padding: 4,
          background: 'rgba(65, 90, 90, 0.5)',
          overflow: 'hidden',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.5)',
          backdropFilter: 'blur(3px)',
          height: '100%'
        }}>
          <div id={id + "border_div"} style={{ height: "100%", width: "100%" }}>
            {videoTrack ? (
              <video autoPlay id={id + "_video"} ref={myRef}
                style={{ display: videoPauseState ? 'block' : 'none' }} />
            ) : audioTrack ? (
              <div style={{ verticalAlign: 'middle', textAlign: 'center', width: '100%' }}>
                <audio autoPlay id={id + "_audio"} ref={myRef} />
              </div>
            ) : ''
            }
            {!videoTrack || !videoPauseState ?
              (
                <div style={{ verticalAlign: 'middle', textAlign: 'center', width: '100%', paddingTop: '15%', paddingBottom: '15%' }}>
                  <img src={avatar} style={{ paddingTop: 15, paddingBottom: 15 }} />
                </div>
              )
              : ''}
          </div>

          <div style={{
            position: 'absolute',
            top: 2,
            textAlign: 'center',
            fontSize: '1.2em',
            color: '#fff',
            fontWeight: 500,
            width: '100%',
            WebkitTextStroke: '0.5px white',
            backgroundColor: 'rgba(0,0,0, 0.3)',
            paddingRight: 10,
            overflow: 'hidden'
          }}>
            <Row>
              <Col sm={12} style={{ textAlign: 'center' }}>
                <span>{username}</span>
                <div style={{ 'float': 'right' }}>
                  {fullscreen ?
                    <FullscreenExitIcon onClick={() => handleFullscreen()} style={{ 'cursor': 'pointer', color: 'white', float: 'right' }}></FullscreenExitIcon>
                    :
                    <FullscreenIcon onClick={() => handleFullscreen()} style={{ 'cursor': 'pointer', color: 'white', float: 'right' }}></FullscreenIcon>
                  }
                  <SettingsIcon style={{ 'cursor': 'pointer', float: 'right', color: "white" }}
                    onClick={() => toggleModal()} />
                </div>
              </Col>
            </Row>
          </div>

          <div style={{
            position: 'absolute',
            fontSize: '1em',
            bottom: 2,
            width: '100%',
            overflow: 'hidden',
            paddingLeft: 2,
            paddingBottom: 2,
            fontWeight: 500,
            backgroundColor: 'rgba(0,0,0, 0.2)'
          }}>
            <Row>
              <Col sm={6}>
                {videoTrack ?
                  videoPauseState ?
                    (<VideocamIcon style={{ 'cursor': 'pointer', color: 'white' }} onClick={() => toggleVideo()} />)
                    : (<VideocamOffIcon style={{ 'cursor': 'pointer' }} color={'secondary'} onClick={() => toggleVideo()} />)
                  : (<VideocamOffIcon color={'action'} />)
                }
                {audioTrack ?
                  audioPauseState ?
                    in_conference ?
                      allowed_to_speak ?
                        (<MicIcon style={{ 'cursor': 'pointer', color: 'white' }} onClick={() => toggleAudio()} />)
                        : hasRequested ?
                          (<MicOffIcon color={'action'} />)
                          : <span onClick={() => requestToSpeak()}>???</span>
                      : (<MicIcon style={{ 'cursor': 'pointer', color: 'white' }} onClick={() => toggleAudio()} />)
                    : (<MicOffIcon style={{ 'cursor': 'pointer' }} color={'secondary'} onClick={() => toggleAudio()} />)
                  : (<MicOffIcon color={'action'} />)
                }
              </Col>

            </Row>
          </div>
        </Card>
        {showModal ?
          <DeviceSettings closeModal={toggleModal} />
          : ''}
        {showFileSharing ?
          <FileSharing closeModal={() => useWorldUserStore.setState({ showFileSharing: false })} />
          : ''}
      </FullScreen>
    </div>
  );
};