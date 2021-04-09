import React, { createRef } from 'react';

import { ToastContainer, toast } from 'react-toastify';
// Icons imports
import { Button } from '@material-ui/core';
import CallIcon from '@material-ui/icons/CallEnd';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import ChatIcon from '@material-ui/icons/Chat';
import 'react-toastify/dist/ReactToastify.css';

import ChatBox from "./ChatBox";
import Carousel from "react-grid-carousel";
import { useCheckMediaAccess, getVideoAudioStream } from "../../utils/checkMediaAccess.js";
import { DeviceSettings } from "./DeviceSettings";
import { storeDevice } from "../../redux/store.js";
import { VideoBox } from "./VideoBox"
import logo from '../../assets/crowdwire_white_logo.png';

interface State {
  chatToggle: boolean;
  displayStream: boolean;
  messages: Array<string>;
  users: { [key: string]: CreateVideo };
}

export default class RoomCall extends React.Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = {
      chatToggle: false,
      displayStream: false,
      messages: [],
      users: {}
    }
    this.chatHandle = this.chatHandle.bind(this);
    this.setNavigatorToStream = this.setNavigatorToStream.bind(this);
    this.toggleAudioTrack = this.toggleAudioTrack.bind(this);
    this.toggleVideoTrack = this.toggleVideoTrack.bind(this);
    this.listenToEndStream = this.listenToEndStream.bind(this);
    this.replaceStream = this.replaceStream.bind(this);
    this.getMyVideo = this.getMyVideo.bind(this);
  }
  myId: string = '12';
  //users: { [key: string]: CreateVideo } = {};
  peers: any = {};
  accessMic: boolean = false;
  accessVideo: boolean = false;
  numberUsers = 0;

  chatHandle = (bool:boolean=false) => {
    this.setState({chatToggle:bool});
  }
  
  setNavigatorToStream = () => {
    getVideoAudioStream(this.accessVideo, this.accessMic).then((stream:MediaStream) => {
      if (stream) {
        if (this.numberUsers == 0) this.createVideo({ id: this.myId, stream });
        else this.createVideo({ id: this.myId + this.numberUsers.toString(), stream });
      }
    })
  }
  
  
  reInitializeStream = (video:boolean=this.accessVideo, audio:boolean=this.accessMic, type:string='userMedia') => {
    // @ts-ignore
    const media = type === 'userMedia' ? getVideoAudioStream(video, audio) : window.navigator.mediaDevices.getDisplayMedia();
    return new Promise((resolve) => {
      media.then((stream:MediaStream) => {
            // @ts-ignore
            const myVideo = this.getMyVideo();
            if (type === 'displayMedia') {
              this.toggleVideoTrack({audio, video});
              this.listenToEndStream(stream, {video, audio});
              //socket.emit('display-media', true);
            }
            this.createVideo({ id: this.myId, stream });
            this.replaceStream(stream);
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
  
  listenToEndStream = (stream:MediaStream, status:MediaStatus) => {
    const videoTrack = stream.getVideoTracks();
      if (videoTrack[0]) {
        videoTrack[0].onended = () => {
              // this.socket.emit('display-media', false);
              this.reInitializeStream(status.video, status.audio);
              // settings.updateInstance('displayStream', false);
              this.toggleVideoTrack(status);
          }
      }
    };
    
  toggleVideoTrack = (status:MediaStatus={video:!this.accessVideo, audio: this.accessMic}) => {
    const myVideo = this.getMyVideo() as HTMLVideoElement;
    this.accessVideo = status.video;
    // @ts-ignore
      if (myVideo) myVideo.srcObject?.getVideoTracks().forEach((track:any) => {
        if (track.kind === 'video') {
          track.enabled = status.video;
          if (!status.video) {
            track.stop()
          } else {
            getVideoAudioStream(this.accessVideo, this.accessMic).then((stream:MediaStream) => {
              if (stream) {
                myVideo.srcObject = stream;
                myVideo.play();
              }
            })
            return;
          }
          // this.socket.emit('user-video-off', {id: this.myId, status: true});
          // changeMediaView(this.myId, true);
        }
      });
  }
  
  toggleAudioTrack = (status:MediaStatus={video:this.accessVideo, audio:!this.accessMic}) => {
    const myVideo = this.getMyVideo();
    this.accessMic = status.audio;
    // @ts-ignore
    if (myVideo) myVideo.srcObject?.getAudioTracks().forEach((track:any) => {
      if (track.kind === 'audio') {
        track.enabled = status.audio;
      }
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

  createVideo = (createObj:CreateVideo) => {
    if (!this.state.users[createObj.id]) {
      this.numberUsers +=1;

      this.setState(state => {
        const users = state.users;
        users[createObj.id] = {
          ...createObj,
        };
        return {users};
      });
    } else {
        //@ts-ignore
        document.getElementById(createObj.id).srcObject = createObj.stream;
        //@ts-ignore
        document.getElementById(createObj.id).play();
    }
  }


  componentDidMount() {
    storeDevice.subscribe((changeMicId) => {
      this.reInitializeStream()
    })

    useCheckMediaAccess().then( (data) => {
      this.accessVideo = data[0]
      this.accessMic = data[1]

      if (this.accessMic) {
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
      if (this.accessVideo) {
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

  
  render () {
    const gridSettings = {
      cols: this.numberUsers > 6 ? 6 : this.numberUsers == 4 ? 2 : this.numberUsers > 4 ? 3 : this.numberUsers,
      rows: this.numberUsers > 3 ? 2 : 1,
      gap: 10,
      loop: true,
      hideArrow: this.numberUsers > 12 ? false : true,
      showDots: this.numberUsers > 12 ? true : false,
      responsiveLayout: [
        {
          breakpoint: 1200,
          cols: this.numberUsers > 3 ? 3 : this.numberUsers,
          rows: this.numberUsers > 3 ? 2 : 1,
          gap: 5,
          loop: true,
          autoplay: false,
          hideArrow: this.numberUsers > 6 ? false : true
        }
      ],
      mobileBreakpoint: 600
    }
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
        <Button color="primary" onClick={this.setNavigatorToStream}>Add Component</Button>
        <Button color="primary" onClick={() => this.reInitializeStream}>Re-initialize Stream</Button>
        <Button color="primary" onClick={() => this.toggleAudioTrack()}>Toggle Audio</Button>
        <Button color="primary" onClick={() => this.toggleVideoTrack()}>Toggle Video</Button>

        { this.numberUsers > 0 ? (
          <Carousel {...gridSettings}>
            { Object.keys(this.state.users).map((key, index) => (
              <Carousel.Item key={index}>
                  <VideoBox username="user1" videoId={key} stream={this.state.users[key].stream} muted={key == this.myId ? true : false}/>
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