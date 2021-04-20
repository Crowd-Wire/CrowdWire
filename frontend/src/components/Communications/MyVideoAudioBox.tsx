import React, { useEffect, useState, useRef } from "react";
import { Card } from '@material-ui/core';
import CardBody from "../Card/CardBody.js";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import { useVideoStore } from "../../webrtc/stores/useVideoStore";
import { useVoiceStore } from "../../webrtc/stores/useVoiceStore";
import { useMuteStore } from "../../webrtc/stores/useMuteStore";
import { wsend } from "../../services/socket.js";
import { sendVoice } from "../../webrtc/utils/sendVoice";
import { sendVideo } from "../../webrtc/utils/sendVideo";

interface MyVideoAudioBoxProps {
  username?: string;
  id: string;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
}

export const MyVideoAudioBox: React.FC<MyVideoAudioBoxProps> = ({
  username="anonymous", id,
  audioTrack=null, videoTrack=null
}) => {
  const { camProducer } = useVideoStore.getState();
  const { micProducer, roomId } = useVoiceStore.getState();

  const myRef = useRef<any>(null);
  const [videoState, setVideoState] = useState(true)
  const [audioState, setAudioState] = useState(true)

  const toggleVideo = () => {
    setVideoState(!videoState)
    useMuteStore.getState().setVideoMute(videoState);
    if (camProducer) {
      if (videoState)
        camProducer.pause();
      else {
        sendVideo();
        camProducer.resume();
      }
      wsend({ topic: "toggle-producer", d: { roomId: roomId, kind: 'video', pause: videoState } })
    }
  }
  const toggleAudio = () => {
    setAudioState(!audioState)
    useMuteStore.getState().setAudioMute(audioState)
    if (micProducer) {
      if (audioState)
        micProducer.pause();
      else {
        sendVoice();
        micProducer.resume();
      }
      wsend({ topic: "toggle-producer", d: { roomId: roomId, kind: 'audio', pause: audioState } });
    }
  }

  useEffect(() => {
    setVideoState(videoTrack ? true : false)
    setAudioState(audioTrack ? true : false)

    const mediaStream = new MediaStream();

    if (videoTrack) {
      mediaStream.addTrack(videoTrack);
    }

    if (audioTrack) {
      mediaStream.addTrack(audioTrack);
    }

    if (myRef.current) {
      myRef.current.srcObject = mediaStream;
      myRef.current.muted = true
    }
  }, [videoTrack, audioTrack])
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
                (<VideocamIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => toggleVideo()}/>)
              : (<VideocamOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleVideo()}/>)
            : (<VideocamOffIcon color={'action'}/>)
          }
          { audioTrack ?
              audioState ? 
                (<MicIcon style={{'cursor': 'pointer'}} color={'primary'} onClick={() => toggleAudio()}/>)
              : (<MicOffIcon style={{'cursor': 'pointer'}} color={'secondary'} onClick={() => toggleAudio()}/>)
            : (<MicOffIcon color={'action'}/>)
          }
        </CardBody>
      </Card>
    </div>
  );
};