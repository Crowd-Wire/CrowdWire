import React, { useEffect, useState, useRef } from "react";
import { Card } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface MediaStreamBoxProps {
  username?: string;
  id: string;
  mediaTrack: MediaStreamTrack;
}

export const MediaStreamBox: React.FC<MediaStreamBoxProps> = ({
  username="anonymous", id, mediaTrack
}) => {
  const myRef = useRef<any>(null);
  
  const useStyles = makeStyles((theme) => ({
    margin: {
      margin: theme.spacing(-1),
    },
  }))

  useEffect(() => {
    const mediaStream = new MediaStream();
    mediaStream.addTrack(mediaTrack);
    
    if (myRef.current) {
      myRef.current.srcObject = mediaStream;
      myRef.current.muted = true
    }
  }, [])

  const classes = useStyles();

  return (
    <div style={{height:'100%', maxWidth:400, width: '100%', overflow: 'auto', display: 'inline-block'}}>
      <Card style={{padding: 3,
      background: 'rgba(215, 240, 240, 0.5)',
      overflow: 'hidden',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
      borderTop: '1px solid rgba(255,255,255,0.5)',
      borderLeft: '1px solid rgba(255,255,255,0.5)',
      backdropFilter: 'blur(3px)',
      height: '100%'
      }}>
          <div style={{padding: 2, textAlign: 'center', fontSize: 18, color: '#3f51b5', fontWeight: 500}}>
            <span>{username}'s Screen</span>
          </div>
          <div>
            <video autoPlay id={id+"_video"} ref={myRef}/>
          </div>
      </Card>
    </div>
  );
};