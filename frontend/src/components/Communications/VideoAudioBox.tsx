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
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import { API_BASE } from "config";

interface VideoAudioBoxProps {
  username?: string;
  id: string;
  avatar?: string;
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
  active, audioToggle, videoToggle,
  avatar=API_BASE + "static/characters/avatars_1_1.png"
}) => {
  const videoRef = useRef<any>(null);

  const [videoState, setVideoState] = useState(videoToggle)
  const [audioState, setAudioState] = useState(audioToggle)
  const handle = useFullScreenHandle();
  const [fullscreen, setFullscreen] = useState(false)

  const toggleVideo = () => {
    setVideoState(!videoState)
  }

  const handleFullscreen = () => {
    if (!fullscreen) {
      handle.enter()
    } else {
      handle.exit()
    }
    setFullscreen(!fullscreen);
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
    <div style={{
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
          <div id={id+"border_div"}>
            { videoTrack ? (
              <video autoPlay id={id+"_video"} ref={videoRef}
                style={{display: videoState ? 'block' : 'none', height: '100%'}}/>
              ) : audioTrack ? (
                <audio autoPlay id={id+"_audio"} ref={videoRef}/>
                ) : ''}
            { !videoTrack || !videoState ?
              (
              <div style={{display: 'block', textAlign: 'center', width: '100%', height: '100%', paddingTop: '15%', paddingBottom: '15%'}}>
               <img src={avatar} style={{paddingTop: 15, paddingBottom: 15}}/>
              </div>
              )
            : '' }
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
            {fullscreen ? 
              <FullscreenExitIcon onClick={() => handleFullscreen()} style={{'cursor': 'pointer', color:'white', float: 'right'}}></FullscreenExitIcon>
            : 
              <FullscreenIcon onClick={() => handleFullscreen()} style={{'cursor': 'pointer', color:'white', float: 'right'}}></FullscreenIcon>
            }
          </div>
          
          <div style={{
            position: 'absolute',
            fontSize: '1em',
            bottom: 2,
            width: '96%',
            paddingLeft: '2px',
            fontWeight: 500,
            backgroundColor: 'rgba(0,0,0, 0.2)'}}>
            <Row>
              <Col sm={6}>
                { videoTrack && !videoToggle ?
                    videoState ? 
                      (<VideocamIcon style={{'cursor': 'pointer', color: 'white'}} onClick={() => toggleVideo()}/>)
                    : (<VideocamOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleVideo()}/>)
                  : (<VideocamOffIcon style={{'color': 'grey'}}/>)
                }
                { audioTrack && !audioToggle ?
                    audioState ? 
                      (<MicIcon style={{'cursor': 'pointer', color: 'white'}} onClick={() => toggleAudio()}/>)
                    : (<MicOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleAudio()}/>)
                  : (<MicOffIcon style={{'color': 'grey'}} />)
                }
              </Col>

              <Col sm={6} style={{textAlign: 'right', maxHeight: 30}}>
                <UserVolumeSlider volColor={'white'} userId={id} />
              </Col>
            </Row>
          </div>
        </Card>
      </FullScreen>
    </div>
  );
};