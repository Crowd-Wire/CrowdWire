import React from 'react';
import TextField from '@material-ui/core/TextField';
import { withStyles, createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';

import { getSocket } from 'services/socket';
import useMessageStore from 'stores/useMessageStore';
import useWorldUserStore from "stores/useWorldUserStore";

import style from "assets/jss/my-kit-react/components/GameDrawer/chatStyle.js";


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
);

const Chat = (props) => {
  const { classes, handleMessage } = props;
  const [text, setText] = React.useState("");
  const ws = getSocket(useWorldUserStore.getState().world_user.world_id);
  const messages = useMessageStore(state => state.messages);
  const chat = React.useRef();
  const classes2 = useStyles();
  const [sendTo, setSendTo] = React.useState('all');

  const handleSelectChange = (event: React.ChangeEvent<{ value: string }>) => {
    setSendTo(event.target.value)
  };

  const handleChange = (event) => {
    setText(event.target.value);
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && text) {
      setText('');
      handleMessage();
      ws.sendMessage(text, sendTo);
    }
  }

  return (
    <div className={classes.chatRoot}>
      <div className={classes.chatBox}>
        <div className={classes.chat} ref={chat} id="text-chat">
          {
            messages.map((m, index) => {
              let from = m.from;
              let color = 'white';
              if (from == useWorldUserStore.getState().world_user.user_id)
                from = useWorldUserStore.getState().world_user.username
              else if (from in useWorldUserStore.getState().users_info) {
                color = useWorldUserStore.getState().users_info[from].color
                from  = useWorldUserStore.getState().users_info[from].username
              }
              return (
                <div key={index} className={classes.message}>
                  <p style={{ margin: '0 0.5rem', fontWeight: 'bold', color: color }}>
                    <span>{from}</span>
                    <span style={{ float: 'right' }}>{m.date}</span>
                  </p>
                  <p style={{ margin: '0 0.5rem' }}>
                    {m.text}
                  </p>
                </div>
              )
            })
          }
        </div>
      </div>
      <div className={classes.sendToInput}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="select-send-to" style={{color: 'white'}}>Send To:</InputLabel>
          <Select
            native
            value={sendTo}
            onChange={handleSelectChange}
            inputProps={{
              id: 'select-send-to',
            }}
            style={{color: 'white'}}
          >
            <option value="all">All</option>
            <option value="nearby">Nearby</option>
          </Select>
        </FormControl>
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
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}

export default withStyles(style)(Chat);
