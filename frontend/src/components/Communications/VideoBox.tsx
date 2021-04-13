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
    }
  }, [])

  return (
    <div>
        {username}
        <video width="100%" autoPlay id={videoId}/>
    </div>
  );
};