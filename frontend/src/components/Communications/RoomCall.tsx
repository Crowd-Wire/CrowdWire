import React, { createRef } from 'react';

import { toast } from 'react-toastify';
// Icons imports
import { Button } from '@material-ui/core';

import Carousel from "react-grid-carousel";
import { useCheckMediaAccess, getVideoAudioStream } from "../../utils/checkMediaAccess.js";
import storeDevice from "../../redux/commStore.js";
import { VideoAudioBox } from "./VideoAudioBox";
import { MyVideoAudioBox } from "./MyVideoAudioBox";
import { MyMediaStreamBox } from "./MyMediaStreamBox";
import { MediaStreamBox } from "./MediaStreamBox";
import logo from '../../assets/crowdwire_white_logo.png';

import { getSocket } from "../../services/socket.js";
import { useVoiceStore } from "../../webrtc/stores/useVoiceStore";
import { useVideoStore } from "../../webrtc/stores/useVideoStore";
import { useMuteStore } from "../../webrtc/stores/useMuteStore";
import { useConsumerStore } from "../../webrtc/stores/useConsumerStore";
import { useRoomStore } from '../../webrtc/stores/useRoomStore';
import useWorldUserStore from "../../stores/useWorldUserStore";
// import { ActiveSpeakerListener } from "../../webrtc/components/ActiveSpeakerListener";
import { sendVoice } from 'webrtc/utils/sendVoice';
import { sendVideo } from 'webrtc/utils/sendVideo';
import { useMediaStore } from 'webrtc/stores/useMediaStore';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import usePlayerStore from "stores/usePlayerStore";
import { API_BASE } from "config";


interface State {
  displayStream: boolean;
  fullscreen: boolean;
  consumerMap: any;
  cam: any;
  mic: any;
  media: any;
}

export default class RoomCall extends React.Component<{}, State> {
  consumerStoreSub: () => void;
  videoStoreSub: () => void;
  voiceStoreSub: () => void;
  mediaStoreSub: () => void;

  constructor(props) {
    super(props);
    this.state = {
      displayStream: false,
      fullscreen: false,
      consumerMap: useConsumerStore.getState().consumerMap,
      cam: useVideoStore.getState().cam,
      mic: useVoiceStore.getState().mic,
      media: useMediaStore.getState().media
    }

    this.consumerStoreSub = useConsumerStore.subscribe((consumerMap) => {
      this.setState({ consumerMap })
    }, (state) => state.consumerMap);

    this.videoStoreSub = useVideoStore.subscribe((cam) => {
      this.setState({ cam });
      sendVideo();
    }, (state) => state.cam);

    this.voiceStoreSub = useVoiceStore.subscribe((mic) => {
      this.setState({ mic });
      sendVoice();
    }, (state) => state.mic);

    this.mediaStoreSub = useMediaStore.subscribe((media) => {
      this.setState({ media });
    }, (state) => state.media);
  }
  myUsername: string = useWorldUserStore.getState().world_user.username;
  avatar: string = API_BASE + "static/characters/" + useWorldUserStore.getState().world_user.avatar + '.png'
  myId: string = useWorldUserStore.getState().world_user.user_id;
  accessMic: boolean = false;
  accessVideo: boolean = false;
  socket = getSocket(useWorldUserStore.getState().world_user.world_id).socket;

  setNavigatorToStream = () => {
    if (this.accessVideo || this.accessMic) {
      getVideoAudioStream(this.accessVideo, this.accessMic).then((stream: MediaStream) => {
        if (stream) {
          useVideoStore.getState().set({ camStream: stream, cam: stream.getVideoTracks()[0] })
          useVoiceStore.getState().set({ micStream: stream, mic: stream.getAudioTracks()[0] })
        }
      })
    }
  }

  handleFullscreen = () => {
    this.setState({ fullscreen: !this.state.fullscreen });
  }

  reInitializeStream = () => {
    const useMic = (this.accessMic && !(useMuteStore.getState().videoMuted))
    const useCam = (this.accessVideo && !(useMuteStore.getState().audioMuted))
    if (useMic|| useCam) {
      const media = getVideoAudioStream(useMic, useCam);
      return new Promise((resolve) => {
        media.then((stream: MediaStream) => {
          useVideoStore.getState().set({ camStream: stream, cam: stream.getVideoTracks()[0] })
          useVoiceStore.getState().set({ micStream: stream, mic: stream.getAudioTracks()[0] })
          resolve(true);
        });
      });
    }
  }

  componentDidMount() {
    storeDevice.subscribe(() => {
      this.reInitializeStream()
    })


    useCheckMediaAccess().then((data) => {
      this.accessVideo = data[0]
      this.accessMic = data[1]
      const toast_props = {
        position: toast.POSITION.TOP_RIGHT,
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
            <img src={logo} style={{ height: 22, width: 22, display: "block", float: "left", paddingRight: 3 }} />
          Microphone Detected 🎙️
        </span>
          , toast_props);
      }
      if (this.accessVideo) {
        useMuteStore.getState().setVideoMute(false)
        toast.dark(
          <span>
            <img src={logo} style={{ height: 22, width: 22, display: "block", float: "left", paddingRight: 3 }} />
            Camera Detected 📹
          </span>
          , toast_props);
      }
      this.setNavigatorToStream();
    }).catch((err) => {
      console.log(err)
    });
  }

  componentWillUnmount() {
    this.consumerStoreSub();
    this.videoStoreSub();
    this.voiceStoreSub();
    this.mediaStoreSub();
    useVideoStore.getState().nullify();
    useVoiceStore.getState().nullify();
    useMediaStore.getState().nullify();
    //@ts-ignore
    for (var key of Object.keys(useRoomStore.getState().rooms)) {
      useConsumerStore.getState().closeRoom(key);
    }
  }


  render() {
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
    let bigScreen = window.innerWidth > 1200;
    let numberCols = bigScreen ? numberUsers > 6 ? 6 : numberUsers : numberUsers > 4 ? 4 : numberUsers;
    let numberRows = bigScreen ? this.state.fullscreen ? numberUsers > 12 ? 3 : numberUsers > 6 ? 2 : 1 : 1 : this.state.fullscreen ? 2 : 1;
    let hasNextPage = numberUsers > (numberCols * numberRows) ? true : false;

    const gridSettings = {
      cols: numberCols,
      rows: numberRows,
      gap: 10,
      loop: true,
      hideArrow: !hasNextPage,
      showDots: hasNextPage,
      mobileBreakpoint: 600
    }
    return (
      <>
      {numberUsers > 0 ?

(   
        <div style={{
          position: 'fixed',
          paddingRight: 80,
          zIndex: 99,
          // height: this.state.fullscreen ? '100%' : '25%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>


          {/* <ActiveSpeakerListener/> */}

          
              <div style={{ height: '100%', padding: 2, width: numberUsers < 4 ? `${23 * numberUsers}%` : '100%', minWidth: numberUsers < 4 ? 240 * numberUsers : 600}}>
                <div style={{ position: 'relative', top: 0, textAlign: 'right', paddingRight: 20, zIndex: 100 }}>
                  {this.state.fullscreen ?
                    (<Button variant="contained" color="primary" onClick={this.handleFullscreen}>Reduce View<FullscreenExitIcon /></Button>)
                    : numberUsers > 6 ?
                      (<Button variant="contained" color="primary" onClick={this.handleFullscreen}>Expand View<FullscreenIcon /></Button>)
                      : ''
                  }
                </div>
                <Carousel {...gridSettings}>

                  {Object.keys(this.state.consumerMap).length > 0
                    && Object.keys(this.state.consumerMap).map((peerId) => {
                      const { consumerAudio, consumerVideo, consumerMedia,
                        volume: userVolume, active,
                        videoToggle, audioToggle
                      } = this.state.consumerMap[peerId];
                      
                     
                      let item = <></>
                      let username = peerId;
                      let avatar= "avatars_1_1";
                      if (peerId in usePlayerStore.getState().users_info) {
                        username = usePlayerStore.getState().users_info[peerId].username;
                        avatar = usePlayerStore.getState().users_info[peerId].avatar;
                      }
                      if (consumerMedia)
                        item = (
                          <Carousel.Item key={peerId + "_crs_media_item"}>
                            <div key={peerId + "_crs_media_item2"} style={{ height: '100%' }}>
                              <MediaStreamBox
                                username={username}
                                id={peerId + '_media'}
                                mediaTrack={consumerMedia._track}
                              />
                            </div>
                          </Carousel.Item>
                        )
                      return [
                        (<Carousel.Item key={peerId + "_crs_item"}>
                            <div key={peerId + "_crs_item2"} style={{ height: '100%' }}>
                              <VideoAudioBox
                                avatar={API_BASE + "static/characters/" + avatar + '.png'}
                                active={active}
                                username={username}
                                id={peerId}
                                audioTrack={consumerAudio ? consumerAudio._track : null}
                                videoTrack={consumerVideo ? consumerVideo._track : null}
                                volume={(userVolume / 200)}
                                videoToggle={videoToggle}
                                audioToggle={audioToggle}
                              />
                            </div>
                          </Carousel.Item>), item]
                    })
                  }

                </Carousel>
              </div>
        </div>
        ) : null}
        <div style={{ position: 'fixed', width: '18%', height: 'auto', right: 10, bottom: 5, zIndex: 99, minWidth: 160, minHeight: 120}}>
          {this.state.media ?
            <MyMediaStreamBox
              username={this.myUsername}
              id={this.myId + '_media'}
              mediaTrack={this.state.media}
            />
            : ''}
          <MyVideoAudioBox
            avatar = {this.avatar}
            username={this.myUsername}
            id={this.myId}
            audioTrack={this.state.mic}
            videoTrack={this.state.cam}
          />
        </div>
      </>
    );
  }
}