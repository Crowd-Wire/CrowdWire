import React, {useState} from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from "components/CustomButtons/Button.js";
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';

import style from "assets/jss/my-kit-react/components/GameDrawer/userListStyle.js";


const example = [
  {name: "TONI", request: true},
  {name: "TOZE", request: false},
  {name: "Tono Tono", request: false},
  {name: "Tino Tino", request: true},
  {name: "Tina", request: false},
]



const UserList = (props) => {
  const {classes} = props;
  const [users, setUsers] = React.useState(example);

  const buttonStyle = {
    width: "0.5rem",
    height: "0.5rem",
    minWidth: 0,
    marginLeft: "0.5rem"
  }

  return (
    <div className={classes.root}>
    {
      users.map((u, index) => (
        <div key={index} className={classes.user}>
            <div className={classes.avatar}></div>
            <div className={classes.content}>
              <div className={classes.username}>{u.name}</div>
              { 
                u.request && 
                  <div className={classes.request}>
                    Request to speak
                    <Button justIcon round color="primary" style={buttonStyle}>
                      <DoneIcon />
                    </Button>
                    <Button justIcon round color="secondary" style={buttonStyle}>
                      <CloseIcon />
                    </Button>
                  </div>
              }
            </div>
        </div>
      ))
    }
    </div>
  );
}

export default withStyles(style)(UserList);
