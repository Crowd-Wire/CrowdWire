import React, { useEffect, useState } from "react";

interface VideoBoxProps {
  username?: string;
  videoId: string;
  stream?: MediaStream;
  muted?: boolean;
}

export const VideoBox: React.FC<VideoBoxProps> = ({
  username="anonymous", stream, muted=false, videoId
}) => {

  useEffect(() => {
    if (stream) {
      const video = (document.getElementById(videoId)! as HTMLVideoElement);
      if (stream) video.srcObject = stream;
      video.muted = muted;
      var playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(_ => {})
        .catch(error => {
        });
      }
    }
  }, [])

  return (
    <div>
        {username}
        <video width="100%" id={videoId}/>
    </div>
  );
};