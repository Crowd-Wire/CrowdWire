import React, { useEffect, useState, useRef } from "react";
import { Card, Button } from '@material-ui/core';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import { useMediaStore } from "../../webrtc/stores/useMediaStore";
import { makeStyles } from '@material-ui/core/styles';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
    <div style={{
      height:'100%',
      maxWidth:400,
      width: '100%',
      overflow: 'auto',
      display: 'inline-block',
    }}>
      <Card style={{padding: 3,
        background: 'rgba(215, 240, 240, 0.5)',
        overflow: 'hidden',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.5)',
        borderLeft: '1px solid rgba(255,255,255,0.5)',
        backdropFilter: 'blur(3px)',
        height: '100%'
      }}>
        <div id={id+"border_div"} style={{height:"100%", width: "100%"}}>
          <video autoPlay id={id+"_video"} ref={myRef}/>
        </div>
        <div style={{
          position: 'absolute',
          top: 2,
          paddingRight: 2,
          textAlign: 'center',
          fontSize: '1.2em',
          color: '#fff',
          fontWeight: 500,
          width: '98%',
          WebkitTextStroke: '0.5px white',
          backgroundColor: 'rgba(0,0,0, 0.3)',
        }}>
          <span>{username}'s Screen</span>
        </div>
        <div style={{position: 'relative', width:'96%', bottom:2, fontSize: '1em'}}>
          <Row>
            <Col sm={12} style={{textAlign: 'center'}}>
              <Button variant="contained" color="primary" size="small"  onClick={() => closeMedia()}  className={classes.margin}>
                Close Screen Share
                <StopScreenShareIcon style={{'cursor': 'pointer', color: 'white'}}/>
              </Button>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};