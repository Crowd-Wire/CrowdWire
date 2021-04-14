import React, { useEffect, useState, useRef } from "react";
import { Button, Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";

interface VideoAudioBoxProps {
  username?: string;
  id: string;
  stream?: MediaStream;
  muted?: boolean;
  volume: number;
  track: MediaStreamTrack;
}

export const VideoAudioBox: React.FC<VideoAudioBoxProps> = ({
  username="anonymous", stream=null, muted=false, id, volume, track=null
}) => {

  const myRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (myRef.current) {
      myRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (stream) {
      const video = (document.getElementById(id)! as HTMLVideoElement);
      video.srcObject = stream;
      video.muted = true;

    } else {
      const audioStream = new MediaStream();
      audioStream.addTrack(track);
      myRef.current.srcObject = audioStream;
      myRef.current.volume = volume;
      myRef.current.muted = muted
    }
  }, [])
  console.log(volume)
  return (
    <div>
      <Card>
        <CardBody>
          <div style={{backgroundColor:"lightblue"}}>
            <h4>{username}</h4>
              { stream ? (
                <video width="100%" autoPlay id={id}/>
              ) : (
                <audio autoPlay id={id+"_audio"} ref={myRef}/>
              )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};