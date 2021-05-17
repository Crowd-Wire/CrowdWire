import React from 'react';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

import { getSocket } from 'services/socket';
import useMessageStore from 'stores/useMessageStore';
import style from "assets/jss/my-kit-react/components/GameDrawer/chatStyle.js";

const Chat = (props) => {
    const {classes} = props;
    const [text, setText] = React.useState("");
    const ws = getSocket('1');
    const messages = useMessageStore(state => state.messages);

    const handleChange = (event) => {
        setText(event.target.value);
    }

    const handleKeyDown = (event) => {
        const value = event.target.value;
        if (event.key === 'Enter' && value) {
            ws.sendMessage(value, 'nearby')
            setText('');
        }
    }

    return (
        <div className={classes.chatRoot}>
            <div className={classes.chatBox}>
                <div className={classes.chat}>
                    {
                        messages.map((m, index) => (
                            <div key={index} className={classes.message}>
                                <p style={{margin: '0 0.5rem', fontWeight: 'bold'}}>
                                    <span>{m.from}</span>
                                    <span style={{float: 'right'}}>{m.date}</span>
                                </p>
                                <p style={{margin: '0 0.5rem'}}>
                                    {m.text}
                                </p>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className={classes.chatInput}>
                <TextField
                    id="outlined-basic" 
                    label={text ? "" : "Send message..."}
                    variant="outlined"
                    InputLabelProps={{ shrink: false }}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    value={text}
                    color="secondary"
                    style={{width: '100%'}}
                />
            </div>
        </div>
    );
}

export default withStyles(style)(Chat);