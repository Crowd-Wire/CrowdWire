import React, {useState, useCallback, useEffect} from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from "components/CustomButtons/Button.js";
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';

import style from "assets/jss/my-kit-react/components/GameDrawer/userListStyle.js";
import usePlayerStore from 'stores/usePlayerStore';
import useWorldUserStore from 'stores/useWorldUserStore';
import { wsend } from "services/socket.js";
import { toast } from 'react-toastify';


const useContextMenu = () => {
  const [xPos, setXPos] = useState("0px");
  const [yPos, setYPos] = useState("0px");
  const [showMenu, setShowMenu] = useState(false);

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();

      setXPos(`${e.pageX}px`);
      setYPos(`${e.pageY}px`);
      setShowMenu(true);
    },
    [setXPos, setYPos]
  );

  const handleClick = useCallback(() => {
    showMenu && setShowMenu(false);
  }, [showMenu]);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.addEventListener("click", handleClick);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  });

  return { xPos, yPos, showMenu };
};


const UserMenu = (props) => {
  const { classes } = props;

  return (
    <>
      <div className={classes.userMenuItem}>olaola</div>
      <div className={classes.userMenuItem}>adeus</div>
    </>
  )
}


const UserList = (props) => {
  const { classes } = props;
  const { xPos, yPos, showMenu } = useContextMenu();
  const users = usePlayerStore(state => state.groupPlayers);

  const handleRequestToSpeak = (user_id, permit) => {
    usePlayerStore.getState().setRequested(user_id, false)
    if (useWorldUserStore.getState().world_user.in_conference) {
      wsend({ topic: "PERMISSION_TO_SPEAK", 'conference': useWorldUserStore.getState().world_user.in_conference, 'permission': permit, 'user_requested': user_id});
    }
    toast.dismiss("customId"+user_id)
  }

  const buttonStyle = {
    width: "0.5rem",
    height: "0.5rem",
    minWidth: 0,
    marginLeft: "0.5rem"
  }

  const handleClick = (event) => {
  
    console.log(event.target)
  }

  return (
    <div className={classes.root}>
    {
      Object.keys(users).map((user_id, index) => (
        <div key={index} className={classes.user} >
            <div className={classes.avatar}></div>
            <div className={classes.content}>
              <div className={classes.username}>{useWorldUserStore.getState().users_info[user_id].username}</div>
              {
                users[user_id].requested && 
                  <div className={classes.request}>
                    Request to speak
                    <Button justIcon round color="primary" style={buttonStyle} onClick={() => handleRequestToSpeak(user_id, true)}>
                      <DoneIcon />
                    </Button>
                    <Button justIcon round style={buttonStyle} onClick={() => handleRequestToSpeak(user_id, false)}>
                      <CloseIcon />
                    </Button>
                  </div>
              }
            </div>
        </div>
      ))
    }
    { showMenu ? (
        <div
          className={"menu-container", classes.userMenu}
          style={{
            top: yPos,
            left: xPos,
          }}
        >
          <UserMenu classes={classes} />
        </div>
      ) : null
    }
    </div>
  );
}

export default withStyles(style)(UserList);
