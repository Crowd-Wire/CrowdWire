import React, { useEffect, useState, useRef } from "react";
import { Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";
import volumeStore from "../../redux/globalVolumeStore.js";
import { UserVolumeSlider } from "./UserVolumeSlider";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

interface VideoAudioBoxProps {
  username?: string;
  id: string;
  muted?: boolean;
  volume: number;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  mediaTrack?: MediaStreamTrack;
  active: boolean;
  videoToggle: boolean;
  audioToggle: boolean;
}

export const VideoAudioBox: React.FC<VideoAudioBoxProps> = ({
  username="anonymous", muted=false, id, volume,
  audioTrack=null, videoTrack=null, mediaTrack=null,
  active, audioToggle, videoToggle
}) => {
  const videoRef = useRef<any>(null);
  const mediaRef = useRef<any>(null);

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
    let mediaStream = null;
    if (mediaTrack) {
      mediaStream = new MediaStream();
      mediaStream.addTrack(mediaTrack);
    }
    if (mediaRef.current) {
      mediaRef.current.muted = true;
      mediaRef.current.srcObject = mediaStream;
    }
  }, [mediaTrack])

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
    <div>
      <Card>
        <CardBody>
          <h4>{username}</h4>
          <div id={id+"border_div"}>
              { videoTrack ? (
                <video width="100%" autoPlay id={id+"_video"} ref={videoRef}
                  style={{display: videoState ? 'block' : 'none'}}/>
                ) : audioTrack ? (
                  <audio autoPlay id={id+"_audio"} ref={videoRef}/>
                  ) : ''}
              { mediaTrack ? (
                <video width="100%" autoPlay id={id+"_video"} ref={mediaRef}/>
              ) : ''}
          </div>
          { videoTrack && !videoToggle ?
              videoState ? 
                (<VideocamIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => toggleVideo()}/>)
              : (<VideocamOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleVideo()}/>)
            : (<VideocamOffIcon color={'action'}/>)
          }
          { audioTrack && !audioToggle ?
              audioState ? 
                (<MicIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => toggleAudio()}/>)
              : (<MicOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleAudio()}/>)
            : (<MicOffIcon color={'action'}/>)
          }

          <UserVolumeSlider userId={id} />

        </CardBody>
      </Card>
    </div>
  );
};