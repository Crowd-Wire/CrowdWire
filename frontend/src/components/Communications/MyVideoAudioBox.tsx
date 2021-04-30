import React, { useEffect, useState, useRef } from "react";
import { Card } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import SettingsIcon from '@material-ui/icons/Settings';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import { useVideoStore } from "../../webrtc/stores/useVideoStore";
import { useVoiceStore } from "../../webrtc/stores/useVoiceStore";
import { useMediaStore } from "../../webrtc/stores/useMediaStore";
import { useRoomStore } from "../../webrtc/stores/useRoomStore";
import { useMuteStore } from "../../webrtc/stores/useMuteStore";
import { wsend } from "../../services/socket.js";
import { sendVoice } from "../../webrtc/utils/sendVoice";
import { sendVideo } from "../../webrtc/utils/sendVideo";
import { sendMedia } from "../../webrtc/utils/sendMedia";
import { DeviceSettings } from "./DeviceSettings";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
  const [videoPauseState, setVideoPauseState] = useState(true)
  const [audioPauseState, setAudioPauseState] = useState(true)
  const [mediaOffState, setMediaOffState] = useState(true)
  const [showModal, setShowModal] = useState(false)

  function toggleModal() {
    setShowModal(!showModal)
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
        wsend({ topic: "toggle-producer", d: { roomId: roomId, kind: 'video', pause: videoPauseState } })
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
        wsend({ topic: "toggle-producer", d: { roomId: roomId, kind: 'audio', pause: audioPauseState } });
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
      wsend({ topic: "close-media", d: { roomId: roomId } })
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
      <div style={{height:'100%',width: '100%', overflow: 'auto', display: 'inline-block'}}>
        <Card style={{padding: 3,
        background: 'rgba(65, 90, 90, 0.5)',
        overflow: 'hidden',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.5)',
        borderLeft: '1px solid rgba(255,255,255,0.5)',
        backdropFilter: 'blur(3px)',
        height: '100%'
      }}>
            <div style={{padding: 2, textAlign: 'center', fontSize: 18, color: '#fff', fontWeight: 500}}>
              <span>{username}</span>
              <SettingsIcon style={{'cursor': 'pointer', float: 'right'}}
                onClick={() => toggleModal()}/>
            </div>
            <div id={id+"border_div"} style={{height:"76%", width: "100%"}}>
                { videoTrack ? (
                  <video autoPlay id={id+"_video"} ref={myRef}
                  style={{display: videoPauseState ? 'block' : 'none'}}/>
                  ) : audioTrack ? (
                    <audio autoPlay id={id+"_audio"} ref={myRef}/>
                    ) : ''}
            </div>

            <div style={{position: 'relative', bottom: 0, width:'100%'}}>
              <Row>
                <Col sm={6}>
                  { videoTrack ?
                      videoPauseState ? 
                      (<VideocamIcon style={{'cursor': 'pointer', color: 'white'}} onClick={() => toggleVideo()}/>)
                      : (<VideocamOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleVideo()}/>)
                      : (<VideocamOffIcon color={'action'}/>)
                    }
                  { audioTrack ?
                      audioPauseState ? 
                      (<MicIcon style={{'cursor': 'pointer', color :'white'}} onClick={() => toggleAudio()}/>)
                      : (<MicOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleAudio()}/>)
                      : (<MicOffIcon color={'action'}/>)
                    }
                </Col>

                <Col style={{textAlign: 'right'}} sm={6}>
                  { mediaOffState ? 
                    <ScreenShareIcon style={{'cursor': 'pointer', color :'white'}} onClick={() => toggleMedia()}/>
                    :
                    <StopScreenShareIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => toggleMedia()}/>
                  }
                </Col>
              </Row>
            </div>
        </Card>
      { showModal ? 
        <DeviceSettings closeModal={toggleModal}/>
      : ''}
    </div>
  );
};