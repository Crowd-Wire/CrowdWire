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
  me?: boolean;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  active: boolean;
}

export const VideoAudioBox: React.FC<VideoAudioBoxProps> = ({
  username="anonymous", muted=false, id, volume,
  audioTrack=null, videoTrack=null, me=false, active
}) => {

  const myRef = useRef<any>(null);

  useEffect(() => {
    if (myRef.current) {
      myRef.current.volume = volume * (volumeStore.getState().globalVolume / 100);;
    }
  }, [volume]);


  useEffect(() => {
    if (active)
      document.getElementById(id+"border_div").style.border = "thick solid #0000FF";
    else
      document.getElementById(id+"border_div").style.border = "0px";
  }, [active]);


  useEffect(() => {
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
                <video width="100%" autoPlay id={id+"_video"} ref={myRef}/>
              ) : audioTrack ? (
                <audio autoPlay id={id+"_audio"} ref={myRef}/>
              ) : ''}
          </div>
          {me ? "" : <UserVolumeSlider userId={id} /> }
        </CardBody>
      </Card>
    </div>
  );
};