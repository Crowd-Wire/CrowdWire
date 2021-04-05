import React, { createContext } from 'react';
import io from 'socket.io-client';
import { WS_BASE } from 'config';
import { useDispatch } from 'react-redux';
import { sendPlayerPosition } from 'redux/store';


// used within class components as a static property
export const WebSocketContext = createContext(null);

// used within functional components
export const useWebsocket = () => React.useContext(WebSocketContext);


/**
 * @author Leandro Silva 
 * 
 * A WebSocketProvider which makes the socket available to any nested components.
 */
export default ({ children }) => {
    let socket;
    let ws;

    const dispatch = useDispatch();

    const sendMessage = (roomId, message) => {
        const payload = {
            roomId: roomId,
            data: message
        }
        socket.emit("event://send-message", JSON.stringify(payload));
        dispatch(sendPlayerPosition(payload));
    }

    if (!socket) {
        socket = io.connect(WS_BASE)

        socket.on("event://get-message", (msg) => {
            const payload = JSON.parse(msg);
            dispatch(sendPlayerPosition(payload));
        })

        ws = {
            socket: socket,
            sendMessage
        }
    }

    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )
}