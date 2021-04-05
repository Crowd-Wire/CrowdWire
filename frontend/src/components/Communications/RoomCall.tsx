import React, { useEffect, useLayoutEffect, createRef, useState } from 'react';

import { ToastContainer, toast } from 'react-toastify';
// Icons imports
import { CircularProgress, Button } from '@material-ui/core';
import CallIcon from '@material-ui/icons/CallEnd';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import ChatIcon from '@material-ui/icons/Chat';
import 'react-toastify/dist/ReactToastify.css';

import videoCall from "../../consts/videoCall";
import ChatBox from "./ChatBox";
import Carousel from "react-grid-carousel";
import { useCheckMediaAccess } from "../../utils/checkMediaAccess.js";
import { DeviceSettings } from "./DeviceSettings";
import { changeMicID } from "../../redux/store.js";
import store from "../../redux/store.js";

import logo from '../../assets/crowdwire_white_logo.png';

interface State {
  micStatus: boolean;
  camStatus: boolean;
  streaming: boolean;
  accessMic: boolean;
  accessVideo: boolean;
  chatToggle: boolean;
  displayStream: boolean;
  messages: Array<string>;
  numberUsers: integer;
}

export default class RoomCall extends React.Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = {
      micStatus: true,
      camStatus: true,
      streaming: false,
      chatToggle: false,
      displayStream: false,
      accessMic: false,
      accessVideo: false,
      messages: [],
      numberUsers: 0
    }
    this.chatHandle = this.chatHandle.bind(this);
    this.setNavigatorToStream = this.setNavigatorToStream.bind(this);
    this.getVideoAudioStream = this.getVideoAudioStream.bind(this);
    this.toggleAudioTrack = this.toggleAudioTrack.bind(this);
    this.toggleVideoTrack = this.toggleVideoTrack.bind(this);
    this.listenToEndStream = this.listenToEndStream.bind(this);
    this.checkAndAddClass = this.checkAndAddClass.bind(this);
    this.replaceStream = this.replaceStream.bind(this);
    this.updateVideoStream = this.updateVideoStream.bind(this);
    this.getMyVideo = this.getMyVideo.bind(this);
  }
  myID: string = '12';
  users: { [key: string]: CreateVideo } = {};
  peers: any = {};
  videoRef = createRef<HTMLVideoElement>();

  
  chatHandle = (bool:boolean=false) => {
    this.setState({chatToggle:bool});
  }
  
  setNavigatorToStream = () => {
    this.getVideoAudioStream().then((stream:MediaStream) => {
      if (stream) {
        this.setState({streaming: true});
        if (this.state.numberUsers == 0) this.createVideo({ id: this.myID, stream });
        else this.createVideo({ id: this.myID + this.state.numberUsers.toString(), stream });
      }
    })
  }
  
  getVideoAudioStream = (video:boolean=true, audio:boolean=true) => {
    let quality = videoCall.quality;
    if (quality) quality = parseInt(quality);

    return navigator.mediaDevices.getUserMedia({
      video: video ? {
        frameRate: quality ? quality : 12,
        noiseSuppression: true,
        width: {min: 640, ideal: 1280, max: 1920},
        height: {min: 480, ideal: 720, max: 1080}
      } : false,
      audio: audio,
    });
  }
  
  
  reInitializeStream = (video:boolean, audio:boolean, type:string='userMedia') => {
    // @ts-ignore
    const media = type === 'userMedia' ? this.getVideoAudioStream(video, audio) : window.navigator.mediaDevices.getDisplayMedia();
    return new Promise((resolve) => {
      media.then((stream:MediaStream) => {
            // @ts-ignore
            const myVideo = this.getMyVideo();
            if (type === 'displayMedia') {
              this.toggleVideoTrack({audio, video});
              this.listenToEndStream(stream, {video, audio});
              //socket.emit('display-media', true);
            }
            this.checkAndAddClass(myVideo, type);
            this.createVideo({ id: this.myID, stream });
            this.replaceStream(stream);
            resolve(true);
          });
        });
  }
  
  removeVideo = (id:string) => {
      delete this.users[id];
      const video = document.getElementById(id);
      if (video) video.remove();
  }
  
  getMyVideo = (id:string=this.myID) => {
    return document.getElementById(id);
  }
  
  listenToEndStream = (stream:MediaStream, status:MediaStatus) => {
    const videoTrack = stream.getVideoTracks();
      if (videoTrack[0]) {
        videoTrack[0].onended = () => {
              // this.socket.emit('display-media', false);
              this.reInitializeStream(status.video, status.audio, 'userMedia');
              // settings.updateInstance('displayStream', false);
              this.toggleVideoTrack(status);
          }
      }
    };
    
  toggleVideoTrack = (status:MediaStatus) => {
    const myVideo = this.getMyVideo();
    // @ts-ignore
      if (myVideo && !status.video) myVideo.srcObject?.getVideoTracks().forEach((track:any) => {
        if (track.kind === 'video') {
          // track.enabled = status.video;
          // this.socket.emit('user-video-off', {id: this.myID, status: true});
          // changeMediaView(this.myID, true);
          !status.video && track.stop();
          }
        });
        else if (myVideo) {
          // this.socket.emit('user-video-off', {id: this.myID, status: false});
          // changeMediaView(this.myID, false);
          this.reInitializeStream(status.video, status.audio);
        }
  }
  
  toggleAudioTrack = (status:MediaStatus) => {
    const myVideo = this.getMyVideo();
    // @ts-ignore
    if (myVideo) myVideo.srcObject?.getAudioTracks().forEach((track:any) => {
      if (track.kind === 'audio')
      track.enabled = status.audio;
      status.audio ? this.reInitializeStream(status.video, status.audio) : track.stop();
    });
  }
  
  
  replaceStream = (mediaStream:MediaStream) => {
    Object.values(this.peers).map((peer:any) => {
      peer.peerConnection?.getSenders().map((sender:any) => {
        if(sender.track.kind == "audio") {
          if(mediaStream.getAudioTracks().length > 0){
            sender.replaceTrack(mediaStream.getAudioTracks()[0]);
          }
        }
        if(sender.track.kind == "video") {
          if(mediaStream.getVideoTracks().length > 0){
            sender.replaceTrack(mediaStream.getVideoTracks()[0]);
          }
        }
      });
    })
  }
  
  checkAndAddClass = (video?:any, type:string='userMedia') => {
    if (video?.classList?.length === 0 && type === 'displayMedia')  
    video.classList.add('display-media');
    else 
    video.classList.remove('display-media');
  }

  createVideo = (createObj:CreateVideo) => {
    if (!this.users[createObj.id]) {
      this.users[createObj.id] = {
          ...createObj,
      };
      this.setState({numberUsers: this.state.numberUsers + 1});
    } else {
        //@ts-ignore
        document.getElementById(createObj.id).srcObject = createObj.stream;
        //@ts-ignore
        document.getElementById(createObj.id).play();
    }
  }

  componentDidMount() {

    store.subscribe((changeMicID) => {
      console.log("store subscription worked")
    })

    useCheckMediaAccess().then( (data) => {
      this.setState({
        accessVideo: data[0],
        accessMic: data[1]
      })
      console.log(data)
      if (this.state.accessMic) {
        toast.dark(
        <span>
          <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
          Microphone Access Granted
        </span>
        ,{
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          pauseOnHover: false,
          progress: undefined,
        });
      }
      if (this.state.accessVideo) {
        toast.dark(
          <span>
            <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
            Video Access Granted
          </span>
          , {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          pauseOnHover: false,
          progress: undefined,
        });
      }
      this.setNavigatorToStream();
    }).catch((err)=> {
      console.log(err)
    });
  }

  componentDidUpdate() {
    this.updateVideoStream();
  }

  updateVideoStream() {
    // maybe just iterate over them and get video by id
    // might cause problems when state changes while doing this function
    if (this.videoRef.current && this.videoRef.current.srcObject !== this.users[this.videoRef.current.id].stream) {
      this.videoRef.current.srcObject = this.users[this.videoRef.current.id].stream
      if (this.myID === this.videoRef.current.id) this.videoRef.current.muted = true;
      this.videoRef.current.play()
    }
  }

  
  render () {
    return (
      <React.Fragment>
      <MicIcon></MicIcon>
      <MicOffIcon></MicOffIcon>
              
        <CallIcon></CallIcon>
          
        <VideocamIcon></VideocamIcon>
        <VideocamOffIcon></VideocamOffIcon>

        <div>
          <h4>
            Share Screen
          </h4>
        </div>

        <div onClick={() => this.chatHandle(!this.state.chatToggle)} title="Chat">
          <ChatIcon></ChatIcon>
        </div>
        <Button onClick={this.setNavigatorToStream}>Add Component</Button>
        <Button onClick={() => this.reInitializeStream(true, true)}>Re-initialize Stream</Button>
        <Button onClick={() => this.toggleAudioTrack({video:true, audio:true})}>Re-initialize Stream</Button>
        <Button onClick={() => this.toggleVideoTrack({video:!this.state.camStatus, audio:this.state.micStatus})}>Re-initialize Stream</Button>


        { this.state.numberUsers > 0 ?
          (
          <Carousel
            justify-content={"center"}
            cols={this.state.numberUsers > 6 ? 6 : this.state.numberUsers}
            rows={this.state.numberUsers > 6 ? 2 : 1}
            gap={10}
            loop={false}
            showDots={this.state.numberUsers > 12 ? true : false}
            // responsiveLayout={[
              //   {
                //     breakpoint: 800,
            //     cols: this.state.numberUsers > 3 ? 3 : this.state.numberUsers,
            //     rows: this.state.numberUsers > 3 ? 2 : 1,
            //     gap: 2,
            //     loop: false,
            //     autoplay: 1000
            //   }
            // ]}
            mobileBreakpoint={600}
          >

            { Object.keys(this.users).map((key, index) => ( 
              <Carousel.Item key={index}>
                <video width="100%" id={key} ref={this.videoRef}/>
              </Carousel.Item>
            ))}
            
          </Carousel>
          ) : '' }
        <DeviceSettings />

        <ChatBox 
          chatToggle={this.state.chatToggle} 
          closeDrawer={() => this.chatHandle(false)} 
          // socketInstance={this.socketInstance.current} 
          // myDetails={userDetails} 
          messages={this.state.messages}>
        </ChatBox>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover={false}
        />
        
      </React.Fragment>
    );
  }
}

interface CreateVideo {
    id: string,
    stream: MediaStream,
    userData?: any,
}

interface MediaStatus {
    video: boolean,
    audio: boolean
}

interface UserVideoToggle {
    id: string,
    status: boolean
}