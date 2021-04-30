import React, { createRef } from 'react';

import { toast } from 'react-toastify';
// Icons imports
import { Button } from '@material-ui/core';

import ChatBox from "./ChatBox";
import Carousel from "react-grid-carousel";
import { useCheckMediaAccess, getVideoAudioStream } from "../../utils/checkMediaAccess.js";
import storeDevice from "../../redux/commStore.js";
import { VideoAudioBox } from "./VideoAudioBox";
import { MyVideoAudioBox } from "./MyVideoAudioBox";
import { MyMediaStreamBox } from "./MyMediaStreamBox";
import { MediaStreamBox } from "./MediaStreamBox";
import logo from '../../assets/crowdwire_white_logo.png';

import { getSocket, wsend } from "../../services/socket.js";
import { useVoiceStore } from "../../webrtc/stores/useVoiceStore";
import { useVideoStore } from "../../webrtc/stores/useVideoStore";
import { useMuteStore } from "../../webrtc/stores/useMuteStore";
import { useConsumerStore } from "../../webrtc/stores/useConsumerStore";
// import { ActiveSpeakerListener } from "../../webrtc/components/ActiveSpeakerListener";
import { sendVoice } from 'webrtc/utils/sendVoice';
import { sendVideo } from 'webrtc/utils/sendVideo';
import { useMediaStore } from 'webrtc/stores/useMediaStore';

interface State {
  chatToggle: boolean;
  displayStream: boolean;
  messages: Array<string>;
  consumerMap: any;
  cam: any;
  mic: any;
  media: any;
}

export default class RoomCall extends React.Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = {
      chatToggle: false,
      displayStream: false,
      messages: [],
      consumerMap: useConsumerStore.getState().consumerMap,
      cam: useVideoStore.getState().cam,
      mic: useVoiceStore.getState().mic,
      media : useMediaStore.getState().media
    }

    useConsumerStore.subscribe((consumerMap) => {
      this.setState({consumerMap})
    }, (state) => state.consumerMap);

    useVideoStore.subscribe((cam) => {
      this.setState({cam});
      sendVideo();
    }, (state) => state.cam);

    useVoiceStore.subscribe((mic) => {
      this.setState({mic});
      sendVoice();
    }, (state) => state.mic);

    useMediaStore.subscribe((media) => {
      this.setState({media});
    }, (state) => state.media);
  }
  myId: string = 'myUsernameId';
  accessMic: boolean = false;
  accessVideo: boolean = false;
  socket = getSocket(1).socket;
  myVideoRef = createRef<any>();

  chatHandle = (bool:boolean=false) => {
    this.setState({chatToggle:bool});
  }
  
  setNavigatorToStream = () => {
    console.log(this.accessMic)
    console.log(this.accessVideo)
    getVideoAudioStream(this.accessVideo, this.accessMic).then((stream:MediaStream) => {
      if (stream) {
        useVideoStore.getState().set({camStream: stream, cam: stream.getVideoTracks()[0]})
        useVoiceStore.getState().set({micStream: stream, mic: stream.getAudioTracks()[0]})
      }
    })
  }
  
  reInitializeStream = (video:boolean=this.accessVideo, audio:boolean=this.accessMic, type:string='userMedia') => {
    // @ts-ignore
    const media = type === 'userMedia' ? getVideoAudioStream(video, audio) : navigator.mediaDevices.getDisplayMedia();
    return new Promise((resolve) => {
      media.then((stream:MediaStream) => {
            useVideoStore.getState().set({camStream: stream, cam: stream.getVideoTracks()[0]})
            useVoiceStore.getState().set({micStream: stream, mic: stream.getAudioTracks()[0]})
            resolve(true);
          });
        });
  }
  
  removeVideo = (id:string) => {
      //delete this.state.users[id];
      const video = document.getElementById(id);
      if (video) video.remove();
  }
  
  getMyVideo = (id:string=this.myId) => {
    return document.getElementById(id);
  }

  componentDidMount() {
    storeDevice.subscribe(() => {
      this.reInitializeStream()
    })


    useCheckMediaAccess().then( (data) => {
      this.accessVideo = data[0]
      this.accessMic = data[1]
      const toast_props = {
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        pauseOnFocusLoss: false,
        pauseOnHover: false,
        progress: undefined,
      }

      if (this.accessMic) {
        useMuteStore.getState().setAudioMute(false)
        toast.dark(
        <span>
          <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
          Microphone Detected 🎙️
        </span>
        ,toast_props);
      }
      if (this.accessVideo) {
        useMuteStore.getState().setVideoMute(false)
        toast.dark(
          <span>
            <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
            Camera Detected 📹 
          </span>
          , toast_props);
      }
      this.setNavigatorToStream();
    }).catch((err)=> {
      console.log(err)
    });
  }

  
  render () {
    let numberUsers = 0;
    for (const value of Object.values(this.state.consumerMap)) {
      //@ts-ignore
      if (value.consumerMedia)
        numberUsers += 2;
      else
        numberUsers += 1;
    };
    // if (this.state.media)
    //   numberUsers += 1;
    const gridSettings = {
      cols: numberUsers > 6 ? 6 : numberUsers,
      rows: numberUsers > 6 ? 2 : 1,
      gap: 10,
      loop: true,
      hideArrow: numberUsers > 12 ? false : true,
      showDots: numberUsers > 12 ? true : false,
      responsiveLayout: [
        {
          breakpoint: 1200,
          cols: numberUsers > 4 ? 4 : numberUsers,
          rows: numberUsers > 4 ? 2 : 1,
          gap: 5,
          loop: true,
          autoplay: 0,
          hideArrow: numberUsers > 6 ? false : true,
          showDots: numberUsers > 8 ? true : false,
        }
      ],
      mobileBreakpoint: 600
    }
    return (
      <React.Fragment>
        {/* <ActiveSpeakerListener/> */}

        <div className="row">
          <Button color="primary" onClick={() => {
            wsend({topic: "join-as-new-peer", d: { roomId: '1' } })}}>
            {/* This will join a room and then create a Transport that allows to Receive data */}
            Join Room 1 and only Send Video
          </Button>
          <Button color="primary" onClick={() => {
            wsend({topic: "join-as-speaker", d: { roomId: '1' } })}}>
            {/* This will join a room and then create a Transport
            that allows to Receive data and another Transport to send data*/}
            Join Room 1 and Send Video Audio
          </Button>
        </div>

        {numberUsers > 0 ? 
        
        (<div  style={{padding: 10}}>
          <Carousel {...gridSettings}>

            { Object.keys(this.state.consumerMap).length > 0 
              && Object.keys(this.state.consumerMap).map((peerId) => {
                const { consumerAudio, consumerVideo, consumerMedia,
                  volume: userVolume, active,
                  videoToggle, audioToggle
                } = this.state.consumerMap[peerId];
                let item = <></>
                if (consumerMedia)
                  item = (<Carousel.Item key={peerId+"_crs_media_item"}>
                  <MediaStreamBox
                    username={peerId}
                    id={peerId+'_media'}
                    mediaTrack={consumerMedia._track}
                  />
                </Carousel.Item>)
                return [
                    (<Carousel.Item key={peerId+"_crs_item"}>
                      <VideoAudioBox
                        active={active}
                        username={peerId}
                        id={peerId}
                        audioTrack={consumerAudio ? consumerAudio._track : null}
                        videoTrack={consumerVideo ? consumerVideo._track : null}
                        volume={(userVolume / 200)}
                        videoToggle={videoToggle}
                        audioToggle={audioToggle}
                      />
                    </Carousel.Item>),item
                ]
              })
            }
            
          </Carousel>
        </div>) : '' }

        <div style={{position: 'fixed', width:'17%', height: '35%', right: 10, bottom: 5}}>
          <MyVideoAudioBox
            username={this.myId}
            id={this.myId}
            audioTrack={this.state.mic}
            videoTrack={this.state.cam}
          />
          { this.state.media ? 
            <MyMediaStreamBox
              username={this.myId}
              id={this.myId+'_media'}
              mediaTrack={this.state.media}
            />
          : '' }
        </div>
        <ChatBox 
          chatToggle={this.state.chatToggle} 
          closeDrawer={() => this.chatHandle(false)} 
          // socketInstance={this.socketInstance.current} 
          // myDetails={userDetails} 
          messages={this.state.messages}>
        </ChatBox>
      </React.Fragment>
    );
  }
}