import React, { useEffect, useState, useRef } from "react";

import { Card } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import SettingsIcon from '@material-ui/icons/SettingsApplicationsTwoTone';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import { wsend } from "../../services/socket.js";
import { sendVoice } from "../../webrtc/utils/sendVoice";
import { sendVideo } from "../../webrtc/utils/sendVideo";
import { sendMedia } from "../../webrtc/utils/sendMedia";
import { DeviceSettings } from "./DeviceSettings";
import { useVideoStore } from "../../webrtc/stores/useVideoStore";
import { useVoiceStore } from "../../webrtc/stores/useVoiceStore";
import { useMediaStore } from "../../webrtc/stores/useMediaStore";
import { useRoomStore } from "../../webrtc/stores/useRoomStore";
import { useMuteStore } from "../../webrtc/stores/useMuteStore";
import useWorldUserStore from "../../stores/useWorldUserStore";
import { toast } from 'react-toastify';
import logo from '../../assets/crowdwire_white_logo.png';
import { useWsHandlerStore } from "../../webrtc/stores/useWsHandlerStore";
import Button from "@material-ui/core/Button";


interface MyVideoAudioBoxProps {
  username?: string;
  id: string;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
}

export const MyVideoAudioBox: React.FC<MyVideoAudioBoxProps> = ({
  username="anonymous", id,
  audioTrack=null, videoTrack=null
}) => {
  const myRef = useRef<any>(null);
  const [videoPauseState, setVideoPauseState] = useState(true);
  const [audioPauseState, setAudioPauseState] = useState(true);
  const [mediaOffState, setMediaOffState] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const handle = useFullScreenHandle();
  const talk_conference = useWorldUserStore(state => state.world_user.role.talk_conference);
  const in_conference = useWorldUserStore(state => state.world_user.in_conference);
  const initial_allowed_to_speak = useState(useWorldUserStore.getState().world_user.role.talk_conference);

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

  const toast_props_requests = {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 60000,
    hideProgressBar: false,
    closeOnClick: false,
    draggable: true,
    progress: undefined,
  }

  const requestToSpeak = () => {
    setHasRequested(true);
    wsend({ topic: "REQUEST_TO_SPEAK", 'conference': in_conference });
  }

  const handleRequestToSpeak = (user_id: any, permit: boolean) => {
    wsend({ topic: "PERMISSION_TO_SPEAK", 'conference': in_conference, 'permission': permit, 'user_id': user_id});
  }

  useEffect(() => {
    useWsHandlerStore.getState().addWsListener(`REQUEST_TO_SPEAK`, (d) => {
      console.log(d.user_requested)
      toast.info(
        <span>
          <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
          The User {d.user_requested} Requested To Speak
          <Button onClick={() => handleRequestToSpeak(d.user_requested, true)}>Allow</Button>
          <Button onClick={() => handleRequestToSpeak(d.user_requested, false)}>Deny</Button>
        </span>
        , toast_props_requests
      );
    })
  }, [])

  useEffect(() => {
    if (in_conference) {
      if (!talk_conference) {
        toast.dark(
          <span>
            <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
            Press the ✋ Near Your Video Box to Request to Speak
          </span>
          , toast_props
        );
      }
    } else if (hasRequested) {
      setHasRequested(false)
      if (!initial_allowed_to_speak) { useWorldUserStore.getState().permissionToSpeak(false) }
    };
  }, [in_conference])

  useEffect(() =>{
    setHasRequested(false);
    if (in_conference && talk_conference) {
      toast.dark(
        <span>
          <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
          Press the ✋ Near Your Video Box to Request to Speak
        </span>
        , toast_props);
    }
  }, [talk_conference])

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
    let { camProducer } = useVideoStore.getState();
    let { rooms } = useRoomStore.getState();

    sendVideo().then(() => camProducer = useVideoStore.getState().camProducer);

    if (camProducer) {
      if (videoPauseState)
        camProducer.pause();
      else
        camProducer.resume();
      for (let roomId in rooms)
        wsend({ topic: "toggle-producer", d: { kind: 'video', pause: videoPauseState } })
    }
  }
  const toggleAudio = () => {
    setAudioPauseState(!audioPauseState)
    useMuteStore.getState().setAudioMute(audioPauseState)
    let { micProducer } = useVoiceStore.getState();
    let { rooms } = useRoomStore.getState();

    sendVoice().then(() => micProducer = useVoiceStore.getState().micProducer);
    
    if (micProducer) {
      if (audioPauseState)
        micProducer.pause();
      else {
        micProducer.resume();
      }
      for (let roomId in rooms)
        wsend({ topic: "toggle-producer", d: { kind: 'audio', pause: audioPauseState } });
    }
  }

  const toggleMedia = () => {
    let { mediaProducer, set } = useMediaStore.getState();
    
    if (mediaOffState)
      sendMedia().then((media) => {
        if (media)
          setMediaOffState(!mediaOffState)
        });
    else if (mediaProducer) {
      mediaProducer.close()
      set({media: null, mediaStream: null, mediaProducer: null})
    }
  }

  useEffect(() => {
    let { rooms } = useRoomStore.getState();

    setMediaOffState(useMediaStore.getState().media ? false : true)
    for (let roomId in rooms)
      wsend({ topic: "close-media" })
    console.log("sending close media")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMediaStore.getState().media])

  useEffect(() => {
    setVideoPauseState(videoTrack ? true : false)
    setAudioPauseState(audioTrack ? true : false)

    const mediaStream = new MediaStream();

    if (videoTrack) {
      mediaStream.addTrack(videoTrack);
    }

    if (audioTrack) {
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
        height:'100%',
        maxWidth:400,
        width: '100%',
        overflow: 'auto',
      }}>
      <FullScreen handle={handle}>
        <Card style={{padding: 4,
          background: 'rgba(65, 90, 90, 0.5)',
          overflow: 'hidden',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.5)',
          backdropFilter: 'blur(3px)',
          height: '100%'
        }}>
            <div id={id+"border_div"} style={{height:"100%", width: "100%"}}>
                { videoTrack ? (
                    <video autoPlay id={id+"_video"} ref={myRef}
                      style={{display: videoPauseState ? 'block' : 'none'}}/>
                  ) : audioTrack ? (
                    <div style={{verticalAlign: 'middle', textAlign: 'center', width: '100%'}}>
                      <img src={`${process.env.PUBLIC_URL}/assets/characters/RPG_assets.png`}/>
                      <audio autoPlay id={id+"_audio"} ref={myRef}/>
                    </div>
                  ) : ''
                }
                { !videoTrack || !videoPauseState ?
                  (
                  <div style={{verticalAlign: 'middle', textAlign: 'center', width: '100%', paddingTop: '15%'}}>
                    <img src={`${process.env.PUBLIC_URL}/assets/characters/RPG_assets.png`} style={{borderRadius: '50%'}}/>
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
                paddingRight: 10
              }}>
                <span>{username}</span>
                { fullscreen ?
                  <FullscreenExitIcon onClick={() => handleFullscreen()} style={{'cursor': 'pointer', color:'white', float: 'right'}}></FullscreenExitIcon>
                :
                  <FullscreenIcon onClick={() => handleFullscreen()} style={{'cursor': 'pointer', color:'white', float: 'right'}}></FullscreenIcon>
                }
                <SettingsIcon style={{'cursor': 'pointer', float: 'right',  color: "white"}}
                  onClick={() => toggleModal()}/>
              </div>

              <div style={{
                position: 'absolute',
                fontSize: '1em',
                bottom: 2,
                width: '96%',
                paddingLeft: 2,
                paddingBottom: 2,
                fontWeight: 500,
                backgroundColor: 'rgba(0,0,0, 0.2)'}}>
                <Row>
                  <Col sm={6}>
                    { videoTrack ?
                        videoPauseState ? 
                        (<VideocamIcon style={{'cursor': 'pointer', color:'white'}} onClick={() => toggleVideo()}/>)
                        : (<VideocamOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleVideo()}/>)
                        : (<VideocamOffIcon color={'action'}/>)
                      }
                    { audioTrack ?
                        audioPauseState ?
                          in_conference ?
                            talk_conference ?
                              (<MicIcon style={{'cursor': 'pointer', color:'white'}} onClick={() => toggleAudio()}/>)
                              : hasRequested ?
                                (<MicOffIcon color={'action'}/>)
                                : <span onClick={() => requestToSpeak()}>✋</span>
                          : (<MicIcon style={{'cursor': 'pointer', color:'white'}} onClick={() => toggleAudio()}/>)
                        : (<MicOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleAudio()}/>)
                      : (<MicOffIcon color={'action'}/>)
                    }
                  </Col>

                  <Col style={{textAlign: 'right'}} sm={6}>
                      { mediaOffState ? 
                        <ScreenShareIcon style={{'cursor': 'pointer', color:'white'}} onClick={() => toggleMedia()}/>
                        :
                        <StopScreenShareIcon style={{'cursor': 'pointer'}} color="secondary" onClick={() => toggleMedia()}/>
                      }
                  </Col>
                </Row>
              </div>
          </Card>
        { showModal ? 
          <DeviceSettings closeModal={toggleModal}/>
        : ''}
      </FullScreen>
    </div>
  );
};