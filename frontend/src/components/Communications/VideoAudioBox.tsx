import React, { useEffect, useState, useRef } from "react";
import { Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";
import volumeStore from "../../redux/globalVolumeStore.js";
import { UserVolumeSlider } from "./UserVolumeSlider";

interface VideoAudioBoxProps {
  username?: string;
  id: string;
  muted?: boolean;
  volume: number;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
}

export const VideoAudioBox: React.FC<VideoAudioBoxProps> = ({
  username="anonymous", muted=false, id, volume, audioTrack=null, videoTrack=null
}) => {

  const myRef = useRef<any>(null);

  useEffect(() => {
    if (myRef.current) {
      myRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);;
    }
  }, [volume]);

  useEffect(() => {
    const mediaStream = new MediaStream();
    
    if (videoTrack) {
      mediaStream.addTrack(videoTrack);
    }
    if (audioTrack) {{
      volumeStore.subscribe(() => {
        myRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);
      })
      mediaStream.addTrack(audioTrack);
    }


    myRef.current.srcObject = mediaStream;
    myRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);
    myRef.current.muted = muted
    }
  }, [videoTrack, audioTrack])
  return (
    <div>
      <Card>
        <CardBody>
          <div>
            <h4>{username}</h4>
              { videoTrack ? (
                <video width="100%" autoPlay id={id+"_video"} ref={myRef}/>
              ) : (
                <audio autoPlay id={id+"_audio"} ref={myRef}/>
              )}
          </div>
          <UserVolumeSlider userId={id} />
        </CardBody>
      </Card>
    </div>
  );
};