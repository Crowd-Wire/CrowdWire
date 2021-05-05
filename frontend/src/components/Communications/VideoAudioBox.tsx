import React, { useEffect, useState, useRef } from "react";
import { Card } from '@material-ui/core';
import volumeStore from "../../redux/globalVolumeStore.js";
import { UserVolumeSlider } from "./UserVolumeSlider";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

interface VideoAudioBoxProps {
  username?: string;
  id: string;
  muted?: boolean;
  volume: number;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  active: boolean;
  videoToggle: boolean;
  audioToggle: boolean;
}

export const VideoAudioBox: React.FC<VideoAudioBoxProps> = ({
  username="anonymous", muted=false, id, volume,
  audioTrack=null, videoTrack=null,
  active, audioToggle, videoToggle
}) => {
  const videoRef = useRef<any>(null);

  const [videoState, setVideoState] = useState(videoToggle)
  const [audioState, setAudioState] = useState(audioToggle)

  const toggleVideo = () => {
    setVideoState(!videoState)
  }

  const toggleAudio = () => {
    setAudioState(!audioState)
    videoRef.current.muted = audioState;
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);;
    }
  }, [volume]);

  useEffect(() => {
    if (active && !muted)
      document.getElementById(id+"border_div").style.border = "thick solid #0000FF";
    else
      document.getElementById(id+"border_div").style.border = "0px";
  }, [active]);

  useEffect(() => {
    setVideoState(videoTrack ? !videoToggle : false)
    setAudioState(audioTrack ? !audioToggle : false)
  }, [videoToggle, audioToggle])

  useEffect(() => {
    setVideoState(videoTrack ? !videoToggle : false)
    setAudioState(audioTrack ? !audioToggle : false)

    const mediaStream = new MediaStream();

    if (videoTrack) {
      mediaStream.addTrack(videoTrack);
    }

    if (audioTrack) {
      volumeStore.subscribe(() => {
        if (videoRef.current) {
          videoRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);
        }
      })
      mediaStream.addTrack(audioTrack);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);
      videoRef.current.muted = muted
    }
  }, [videoTrack, audioTrack])
  return (
    <div className="video_div_card">
      <Card style={{padding: 3,
        background: 'rgba(65, 90, 90, 0.5)',
        overflow: 'hidden',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.5)',
        borderLeft: '1px solid rgba(255,255,255,0.5)',
        backdropFilter: 'blur(3px)',
        height: '100%'
      }}>
          
          <div id={id+"border_div"}>
            { videoTrack ? (
              <video autoPlay id={id+"_video"} ref={videoRef}
                style={{display: videoState ? 'block' : 'none'}}/>
              ) : audioTrack ? (
                <audio autoPlay id={id+"_audio"} ref={videoRef}/>
                ) : ''}
          </div>

          <div style={{
              position: 'absolute',
              top:2,
              padding: 2,
              textAlign: 'center',
              fontSize: '1.2em',
              color: 'white',
              width: '98%',
              fontWeight: 500,
              backgroundColor: 'rgba(0,0,0, 0.2)',
            }}>
            <span>{username}</span>
          </div>
          
          <div style={{position: 'relative', fontSize: '1em', bottom: 0, width: '100%', paddingLeft: '2px'}}>
            <Row>
              <Col sm={5}>
                { videoTrack && !videoToggle ?
                    videoState ? 
                      (<VideocamIcon style={{'cursor': 'pointer', color: 'white'}} onClick={() => toggleVideo()}/>)
                    : (<VideocamOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleVideo()}/>)
                  : (<VideocamOffIcon color={'action'}/>)
                }
                { audioTrack && !audioToggle ?
                    audioState ? 
                      (<MicIcon style={{'cursor': 'pointer', color: 'white'}} onClick={() => toggleAudio()}/>)
                    : (<MicOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleAudio()}/>)
                  : (<MicOffIcon color={'action'}/>)
                }
              </Col>

              <Col sm={7} style={{textAlign: 'center', maxHeight: 30}}>
                <UserVolumeSlider volColor={'white'} userId={id} />
              </Col>
            </Row>
          </div>
      </Card>
    </div>
  );
};