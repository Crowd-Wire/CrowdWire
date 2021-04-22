import React, { useEffect, useState, useRef } from "react";
import { Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
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
  const [mediaOffStatetate, setMediaOffStatetate] = useState(true)

  const toggleVideo = () => {
    setVideoPauseState(!videoPauseState)
    useMuteStore.getState().setVideoMute(videoPauseState);
    let { camProducer } = useVideoStore.getState();
    let { roomId } = useRoomStore.getState();

    sendVideo().then(() => camProducer = useVideoStore.getState().camProducer);

    if (camProducer) {
      if (videoPauseState)
        camProducer.pause();
      else
        camProducer.resume();
      wsend({ topic: "toggle-producer", d: { roomId: roomId, kind: 'video', pause: videoPauseState } })
    }
  }
  const toggleAudio = () => {
    setAudioPauseState(!audioPauseState)
    useMuteStore.getState().setAudioMute(audioPauseState)
    let { micProducer } = useVoiceStore.getState();
    let { roomId } = useRoomStore.getState();

    sendVoice().then(() => micProducer = useVoiceStore.getState().micProducer);
    
    if (micProducer) {
      if (audioPauseState)
        micProducer.pause();
      else {
        micProducer.resume();
      }
      wsend({ topic: "toggle-producer", d: { roomId: roomId, kind: 'audio', pause: audioPauseState } });
    }
  }

  const toggleMedia = () => {
    setMediaOffStatetate(!mediaOffStatetate)
    let { mediaProducer } = useMediaStore.getState();
    
    if (mediaOffStatetate)
      sendMedia().then(() => mediaProducer = useMediaStore.getState().mediaProducer);
    // else if (mediaProducer)
      // TODO tratar do desligar
        // mediaProducer.close
  }

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
    <div style={{maxHeight:'10%', maxWidth:400}}>
      <Card style={{padding: 3,
      background: 'rgba(205, 245, 245, 0.7)',
      overflow: 'hidden',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
      borderTop: '1px solid rgba(255,255,255,0.5)',
      borderLeft: '1px solid rgba(255,255,255,0.5)',
      backdropFilter: 'blur(3px)'
      }}>
          <div style={{padding: 2, textAlign: 'center', fontSize: '1.3em', color: '#fff', fontWeight: 500}}>
            <span>{username}</span>
          </div>
          <div id={id+"border_div"}>
              { videoTrack ? (
                <video autoPlay id={id+"_video"} ref={myRef}
                  style={{display: videoPauseState ? 'block' : 'none'}}/>
                ) : audioTrack ? (
                  <audio autoPlay id={id+"_audio"} ref={myRef}/>
                  ) : ''}
          </div>

          <Row>
            <Col sm={6}>
              { videoTrack ?
                  videoPauseState ? 
                    (<VideocamIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => toggleVideo()}/>)
                  : (<VideocamOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleVideo()}/>)
                : (<VideocamOffIcon color={'action'}/>)
              }
              { audioTrack ?
                  audioPauseState ? 
                    (<MicIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => toggleAudio()}/>)
                  : (<MicOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleAudio()}/>)
                : (<MicOffIcon color={'action'}/>)
              }
            </Col>

            <Col style={{textAlign: 'right'}} sm={6}>
              <ScreenShareIcon style={{'cursor': 'pointer'}} color={'action'} onClick={() => toggleMedia()}/>
              <StopScreenShareIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => toggleMedia()}/>
            </Col>
          </Row>

      </Card>
    </div>
  );
};