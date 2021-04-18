import React, { useEffect, useState, useRef } from "react";
import { Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";
import volumeStore from "../../redux/globalVolumeStore.js";
import { UserVolumeSlider } from "./UserVolumeSlider";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

interface MyVideoAudioBoxProps {
  username?: string;
  id: string;
  muted?: boolean;
  volume: number;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
}

export const MyVideoAudioBox: React.FC<MyVideoAudioBoxProps> = ({
  username="anonymous", muted=false, id, volume,
  audioTrack=null, videoTrack=null
}) => {

  const myRef = useRef<any>(null);
  const [videoState, setVideoState] = useState(true)
  const [audioState, setAudioState] = useState(true)

  const togleVideo = () => {
    setVideoState(!videoState)
  }

  useEffect(() => {
    if (myRef.current) {
      myRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);;
    }
  }, [volume]);

  useEffect(() => {
    setVideoState(videoTrack ? true : false)

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
  }, [videoTrack, audioTrack, volumeStore.getState().globalVolume])
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
                (<VideocamIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => togleVideo()}/>)
              : (<VideocamOffIcon style={{'cursor': 'pointer'}} color={'action'} onClick={() => togleVideo()}/>)
            : (<VideocamOffIcon color={'secondary'}/>)
          }
          { audioTrack ?
            (<MicIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => togleVideo()}/>)
            : (<MicOffIcon color={'secondary'}/>)
          }
        </CardBody>
      </Card>
    </div>
  );
};