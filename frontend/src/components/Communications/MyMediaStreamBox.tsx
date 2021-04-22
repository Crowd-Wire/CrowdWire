import React, { useEffect, useState, useRef } from "react";
import { Card, Button } from '@material-ui/core';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import { useMediaStore } from "../../webrtc/stores/useMediaStore";
import { makeStyles } from '@material-ui/core/styles';

interface MyMediaStreamBoxProps {
  username?: string;
  id: string;
  mediaTrack: MediaStreamTrack;
}

export const MyMediaStreamBox: React.FC<MyMediaStreamBoxProps> = ({
  username="anonymous", id, mediaTrack
}) => {
  const myRef = useRef<any>(null);
  
  const useStyles = makeStyles((theme) => ({
    margin: {
      margin: theme.spacing(-1),
    },
  }))

  const closeMedia = () => {
    let { set } = useMediaStore.getState();
    useMediaStore.getState().mediaProducer.close();
    set({media: null, mediaStream: null, mediaProducer: null})
  }

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
    <div style={{maxHeight:'10%', maxWidth:400}}>
      <Card style={{padding: 3,
      background: 'rgba(65, 90, 90, 0.6)',
      overflow: 'hidden',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
      borderTop: '1px solid rgba(255,255,255,0.5)',
      borderLeft: '1px solid rgba(255,255,255,0.5)',
      backdropFilter: 'blur(3px)'
      }}>
          <div style={{padding: 2, textAlign: 'center', fontSize: '1.3em', color: '#fff', fontWeight: 500}}>
            <span>{username}'s Stream</span>
          </div>
          <div>
            <video autoPlay id={id+"_video"} ref={myRef}/>
          </div>

          <div style={{textAlign: 'center'}}>
            <Button variant="contained" color="primary" size="small"  onClick={() => closeMedia()}  className={classes.margin}>
              Close Screen Share
              <StopScreenShareIcon style={{'cursor': 'pointer', color: 'white'}}/>
            </Button>
          </div>

      </Card>
    </div>
  );
};