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
  active: boolean;
  videoToggle: boolean;
  audioToggle: boolean;
}

export const VideoAudioBox: React.FC<VideoAudioBoxProps> = ({
  username="anonymous", muted=false, id, volume,
  audioTrack=null, videoTrack=null, active, audioToggle, videoToggle
}) => {

  const myRef = useRef<any>(null);
  const [videoState, setVideoState] = useState(videoToggle)
  const [audioState, setAudioState] = useState(audioToggle)

  const toggleVideo = () => {
    setVideoState(!videoState)
  }

  const toggleAudio = () => {
    setAudioState(!audioState)
    myRef.current.muted = audioState;
  }

  useEffect(() => {
    if (myRef.current) {
      myRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);;
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

    const mediaStream = new MediaStream();

    if (videoTrack) {
      mediaStream.addTrack(videoTrack);
    }

    if (audioTrack) {
      volumeStore.subscribe(() => {
        if (myRef.current) {
          myRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);
        }
      })
      mediaStream.addTrack(audioTrack);
    }

    if (myRef.current) {
      myRef.current.srcObject = mediaStream;
      myRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);
      myRef.current.muted = muted
    }
  }, [videoTrack, audioTrack, volumeStore.getState().globalVolume, videoToggle, audioToggle])
  return (
    <div>
      <Card>
        <CardBody>
          <h4>{username}</h4>
          <div id={id+"border_div"}>
              { videoTrack ? (
                <video width="100%" autoPlay id={id+"_video"} ref={myRef}
                  style={{display: videoState ? 'block' : 'none'}}/>
                ) : audioTrack ? (
                  <audio autoPlay id={id+"_audio"} ref={myRef}/>
                  ) : ''}
          </div>
          { videoTrack ?
              videoState ? 
                (<VideocamIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => toggleVideo()}/>)
              : (<VideocamOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleVideo()}/>)
            : (<VideocamOffIcon color={'action'}/>)
          }
          { audioTrack ?
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