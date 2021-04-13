import React, { useEffect, useState, useRef } from "react";

interface VideoBoxProps {
  username?: string;
  videoId: string;
  stream?: MediaStream;
  muted?: boolean;
  volume: number;
}

export const VideoBox: React.FC<VideoBoxProps> = ({
  username="anonymous", stream, muted=false, videoId, volume
}) => {

  const myRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (myRef.current) {
      myRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (stream) {
      const video = (document.getElementById(videoId)! as HTMLVideoElement);
      video.srcObject = stream;
      video.muted = muted;

      myRef.current.srcObject = stream;
      myRef.current.volume = volume;
    }
  }, [])

  return (
    <div>
        {username}
        <video width="100%" autoPlay id={videoId}/>

        <audio autoPlay id={videoId+"_audio"} ref={myRef}/>
        
    </div>
  );
};