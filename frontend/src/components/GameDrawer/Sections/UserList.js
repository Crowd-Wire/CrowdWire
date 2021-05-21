import React, {useState, useCallback, useEffect} from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from "components/CustomButtons/Button.js";
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';

import style from "assets/jss/my-kit-react/components/GameDrawer/userListStyle.js";
import usePlayerStore from 'stores/usePlayerStore';


const example = [
  {name: "TONI", request: true},
  {name: "TOZE", request: false},
  {name: "Tono Tono", request: false},
  {name: "Tino Tino", request: true},
  {name: "Tina", request: false},
]


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
      Object.values(users).map((u, index) => (
        <div key={index} className={classes.user} >
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
                    <Button justIcon round style={buttonStyle}>
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
            // opacity: interpolatedStyle.opacity,
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
