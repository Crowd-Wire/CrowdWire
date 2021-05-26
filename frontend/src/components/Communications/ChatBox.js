import React, { useState } from 'react';
import { Button, Drawer, Input } from '@material-ui/core';
import { getMessageDateOrTime } from "../../utils/textChatDate";
// Import Styles
import "../../assets/scss/style/chatDrawer.scss";
// Import Icons
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChatIcon from '@material-ui/icons/Chat';

function ChatBox(props) {
    const [chatText, setChatText] = useState('');

    const handleChatText = (event) => {
        const { value } = event.target;
        setChatText(value);
    }

    const handleSendText = (event) => {
        if (!(chatText.length > 0)) return;
        if (event.type === 'keyup') return;
        const messageDetails = {
            message: {
                message: chatText,
                timestamp: new Date()
            },
            userData: {...props.myDetails}
        }
        props.socketInstance.broadcastMessage(messageDetails);
        setChatText('');
    }

    return (
        <React.Fragment>
            <Drawer className="chat-drawer" anchor={'right'} open={props.chatToggle} onClose={props.closeDrawer}>
                <div className="chat-head-wrapper">
                    <div className="chat-drawer-back-icon" onClick={props.closeDrawer}>
                        <ChevronRightIcon></ChevronRightIcon>
                    </div>
                    <div className="chat-header">
                        <ChatIcon></ChatIcon>
                        <h3 className="char-header-text">Chat</h3>
                    </div>
                </div>
                <div className="chat-drawer-list">
                    {
                        props.messages?.map((chatDetails) => {
                            const { userData, message } = chatDetails;
                            return (
                                <div className="message-container">
                                    <div className={`message-wrapper ${!userData.userID ? 'message-wrapper-right' : ''}`}>
                                        <div className="message-title-wrapper">
                                            <h5 className="message-name">{useWorldUserStore.users_info[userData.userID]?.username}</h5>
                                            <span className="message-timestamp">{getMessageDateOrTime(message.timestamp)}</span>
                                        </div>
                                        <p className="actual-message">{message.message}</p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                {/* <List className="chat-drawer-list">
                    
                </List> */}
                <div className="chat-drawer-input-wrapper" onKeyUp={handleSendText}>
                    <Input 
                        className="chat-drawer-input" 
                        onChange={handleChatText} 
                        value={chatText}
                        placeholder="Type Here"
                    />
                    <Button onClick={handleSendText}>Send</Button>
                </div>
            </Drawer>
        </React.Fragment>
    )
}

export default ChatBox;