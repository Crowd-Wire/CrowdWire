import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
// import { createSocketConnectionInstance } from '../../../services/socketConnection/socketConnection';
// import FootBar from '../../resuableComponents/navbar/footbar';
// import { getObjectFromUrl } from '../../../utils/helper';
// import UserPopup from '../../resuableComponents/popup/userPopup';
import { ToastContainer } from 'react-toastify';
// Icons imports
import { CircularProgress } from '@material-ui/core';
import CallIcon from '@material-ui/icons/CallEnd';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import ChatIcon from '@material-ui/icons/Chat';
import 'react-toastify/dist/ReactToastify.css';

import videoCall from "../../consts/videoCall";
import ChatBox from "./ChatBox";


class RoomCall extends React.Component {

    constructor(props) {
        super(props);
        // this.socketInstance = useRef(null);
        this.state = {
            chatToggle: false,
            messages: []
        }
        // const [micStatus, setMicStatus] = useState(true);
        // const [camStatus, setCamStatus] = useState(true);
        // const [streaming, setStreaming] = useState(false);
        // const [userDetails, setUserDetails] = useState(null);
        // const [displayStream, setDisplayStream] = useState(false);
        // const [messages, setMessages] = useState([]);

        this.chatHandle = this.chatHandle.bind(this);
    }

    componentDidMount() {

    }

    // startConnection = () => {
    //     let params = getObjectFromUrl();
    //     if (!params) params = {quality: 12}
    //     this.socketInstance.current = createSocketConnectionInstance({
    //         updateInstance: updateFromInstance,
    //         params,
    //         userDetails
    //     });
    // }

    // updateFromInstance = (key, value) => {
    //     if (key === 'streaming') setStreaming(value);
    //     if (key === 'message') setMessages([...value]);
    //     if (key === 'displayStream') setDisplayStream(value);
    // }

    // handleDisconnect = () => {
    //     this.socketInstance.current?.destoryConnection();
    //     props.history.push('/');
    // }

    // handleMyMic = () => {
    //     const { getMyVideo, reInitializeStream } = this.socketInstance.current;
    //     const myVideo = getMyVideo();
    //     if (myVideo) myVideo.srcObject?.getAudioTracks().forEach((track) => {
    //         if (track.kind === 'audio')
    //             // track.enabled = !micStatus;
    //             micStatus ? track.stop() : reInitializeStream(camStatus, !micStatus);
    //     });
    //     setMicStatus(!micStatus);
    // }

    // handleMyCam = () => {
    //     if (!displayStream) {
    //         const { toggleVideoTrack } = this.socketInstance.current;
    //         toggleVideoTrack({ video: !camStatus, audio: micStatus });
    //         setCamStatus(!camStatus);
    //     }
    // }

    // handleuserDetails = (userDetails) => {
    //     setUserDetails(userDetails);
    // }

    chatHandle(bool=false) {
        this.setState({
            chatToggle: bool
        })
    }

    // toggleScreenShare = () => {
    //     const { reInitializeStream, toggleVideoTrack } = this.socketInstance.current;
    //     displayStream && toggleVideoTrack({video: false, audio: true});
    //     reInitializeStream(false, true, !displayStream ? 'displayMedia' : 'userMedia').then(() => {
    //         setDisplayStream(!displayStream);
    //         setCamStatus(false);
    //     });
    // }
    
    render() {
  
        return (
            <React.Fragment>
                {/* {userDetails !== null && !streaming &&  */}
                    <div className="stream-loader-wrapper">
                        <CircularProgress className="stream-loader" size={24} color="primary" />
                    </div>
                {/* } */}
                <div id="room-container"></div>
                    <div>
                        {/* {streaming && <div className="status-action-btn mic-btn" onClick={handleMyMic} title={micStatus ? 'Disable Mic' : 'Enable Mic'}> */}
                            {/* {micStatus ?  */}
                            <div className="status-action-btn mic-btn">
                                <MicIcon></MicIcon>
                                :
                                <MicOffIcon></MicOffIcon>
                            {/* } */}
                            </div>
                        {/* } */}
                        {/* <div className="status-action-btn end-call-btn" onClick={handleDisconnect} title="End Call"> */}
                        <div className="status-action-btn end-call-btn" title="End Call">
                            <CallIcon></CallIcon>
                        </div>
                        {/* {streaming && <div className="status-action-btn cam-btn" onClick={handleMyCam} title={camStatus ? 'Disable Cam' : 'Enable Cam'}> */}
                        <div className="status-action-btn cam-btn">
                            {/* {camStatus ?  */}
                                <VideocamIcon></VideocamIcon>
                                :
                                <VideocamOffIcon></VideocamOffIcon>
                            {/* } */}
                        </div>
                        {/* } */}
                    </div>
                    <div>
                        {/* <div className="screen-share-btn" onClick={toggleScreenShare}> */}
                        <div className="screen-share-btn">
                            <h4 className="screen-share-btn-text">
                                Share Screen
                                {/* {displayStream ? 'Stop Screen Share' : 'Share Screen'} */}
                            </h4>
                        </div>
                        <div onClick={() => this.chatHandle(!this.state.chatToggle)} className="chat-btn" title="Chat">
                        {/* <div className="chat-btn" title="Chat"> */}
                            <ChatIcon></ChatIcon>
                        </div>
                    </div>
                {/* <UserPopup submitHandle={handleuserDetails}></UserPopup> */}
                <ChatBox 
                    chatToggle={this.state.chatToggle} 
                    closeDrawer={() => this.chatHandle(false)} 
                    // socketInstance={this.socketInstance.current} 
                    // myDetails={userDetails} 
                    messages={this.state.messages}>
                </ChatBox>
                <ToastContainer 
                    autoClose={2000}
                    closeOnClick
                    pauseOnHover
                />
            </React.Fragment>
        );
    }
}

export default RoomCall;