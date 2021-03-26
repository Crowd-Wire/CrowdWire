import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

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
import Carousel from "react-grid-carousel";


const RoomCall = (props: any) => {
  // this.socketInstance = useRef(null);
  const [micStatus, setMicStatus] = useState(true);
  const [camStatus, setCamStatus] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [chatToggle, setChatToggle] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [displayStream, setDisplayStream] = useState(false);
  const [messages, setMessages] = useState([]);
  const [numberUsers, setNumberUsers] = useState(9);



  const chatHandle = (bool:boolean=false) => {
    setChatToggle(bool);
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

      <div onClick={() => chatHandle(!chatToggle)} title="Chat">
        <ChatIcon></ChatIcon>
      </div>

      <Carousel 
        justify-content={"center"}
        cols={numberUsers > 6 ? 6 : numberUsers}
        rows={numberUsers > 6 ? 2 : 1}
        gap={2}
        loop={false}
        showDots={true}
        responsiveLayout={[
          {
            breakpoint: 800,
            cols: numberUsers > 3 ? 3 : numberUsers,
            rows: numberUsers > 3 ? 2 : 1,
            gap: 2,
            loop: false,
            autoplay: 1000
          }
        ]}
        mobileBreakpoint={600}
      >

        <Carousel.Item>
          <img width="100%" src="https://picsum.photos/800/600?random=1" />
        </Carousel.Item>
        <Carousel.Item>
          <img width="100%" src="https://picsum.photos/800/600?random=2" />
        </Carousel.Item>
        <Carousel.Item>
          <img width="100%" src="https://picsum.photos/800/600?random=3" />
        </Carousel.Item>
        <Carousel.Item>
          <img width="100%" src="https://picsum.photos/800/600?random=4" />
        </Carousel.Item>
        <Carousel.Item>
          <img width="100%" src="https://picsum.photos/800/600?random=5" />
        </Carousel.Item>
        <Carousel.Item>
          <img width="100%" src="https://picsum.photos/800/600?random=6" />
        </Carousel.Item>
        <Carousel.Item>
          <img width="100%" src="https://picsum.photos/800/600?random=7" />
        </Carousel.Item>
        <Carousel.Item>
          <img width="100%" src="https://picsum.photos/800/600?random=8" />
        </Carousel.Item>
        <Carousel.Item>
          <img width="100%" src="https://picsum.photos/800/600?random=9" />
        </Carousel.Item>


      </Carousel>


      <ChatBox 
        chatToggle={chatToggle} 
        closeDrawer={() => chatHandle(false)} 
        // socketInstance={this.socketInstance.current} 
        // myDetails={userDetails} 
        messages={messages}>
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
        pauseOnHover
      />
    </React.Fragment>
  );
}

export default RoomCall;