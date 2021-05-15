
import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TextsmsIcon from '@material-ui/icons/Textsms';
import SettingsIcon from '@material-ui/icons/Settings';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import Chat from './Sections/Chat';
import UserList from './Sections/UserList';
import WorldSettings from "views/WorldSettings/WorldSettings.js";

import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import CancelIcon from '@material-ui/icons/Cancel';

const drawerWidth = 360;
const sideBarWidth = 80;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    menuButton: {
    },
    hide: {
      display: 'none',
    },
    sideBar: {
      padding: '1rem 0',
      display: 'flex',
      flexDirection: 'column',
      width: sideBarWidth,
      zIndex: 1202,
      backgroundColor: '#1f344d',
      height: '100%'
    },
    sideTop: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
    sideBot: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      justifyContent: 'flex-end'
    },
    drawer: {
      // width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      paddingLeft: sideBarWidth,
      backgroundColor: '#3A506B',

    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
  }),
);

const GameDrawer = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [fullScreen, setFullScreen] = React.useState(false);
  const [drawer, setDrawer] = React.useState(null);
  const [page, setPage] = React.useState(null);

  const handleDrawerOpen = (component) => {
    setDrawer(component);
    setPage(null);
  };

  const handleDrawerClose = () => {
    setDrawer(null);
  };

  const handleOpen = (component) => {
    setPage(component);
    setDrawer(null);
  };

  const handleClose = () => {
    setPage(null);
  };

  document.addEventListener('fullscreenchange', (event) => {
    if (document.fullscreenElement) {
      // entered full-screen mode
      setFullScreen(true);
    } else {
      setFullScreen(false);
    }
  })

  const handleFullscreen = () => {
    if (!fullScreen) {
      setFullScreen(true);
      openFullscreen();
    } else {
      setFullScreen(false);
      closeFullscreen();
    }
  }

  const openFullscreen = () => {
    /* View in fullscreen */
    const elem = document.documentElement as HTMLElement & {
      mozRequestFullScreen(): Promise<void>;
      webkitRequestFullscreen(): Promise<void>;
      msRequestFullscreen(): Promise<void>;
    };
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  }

  const closeFullscreen = () => {
    /* Close fullscreen */
    const doc = document as Document & {
      mozCancelFullScreen(): Promise<void>;
      webkitExitFullscreen(): Promise<void>;
      msExitFullscreen(): Promise<void>;
    };
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) { /* Safari */
      doc.webkitExitFullscreen();
    } else if (doc.msExitFullscreen) { /* IE11 */
      doc.msExitFullscreen();
    }
  }

  const iconsStyle = {color: "#fff", fontSize: '2rem'};

  return (
    <>
    <div className={classes.root}>

      <div className={clsx(classes.sideBar, "text-center")}>
        <div className={classes.sideTop}>
          <IconButton
            aria-label="open drawer"
            onClick={() => handleDrawerOpen(<Chat />)}
          >
            <TextsmsIcon style={iconsStyle} />
          </IconButton>
          <IconButton
            aria-label="open drawer"
            onClick={() => handleDrawerOpen(<UserList />)}
          >
            <PeopleAltIcon style={iconsStyle} />
          </IconButton>
        </div>
        <div className={classes.sideBot}>
          <IconButton
            aria-label="open drawer"
            onClick={() => handleOpen(<WorldSettings />)}
          >
            <SettingsIcon style={iconsStyle} />
          </IconButton>
          <IconButton onClick={handleFullscreen}>
          {
            fullScreen ?
            <FullscreenExitIcon style={iconsStyle} />
            : <FullscreenIcon style={iconsStyle} />
          }
          </IconButton>
        </div>
      </div>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={drawer != null}
        classes={{
          paper: classes.drawerPaper,
        }}
        // style={ open ? {
          
        //   transform: 'none',
        //   transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
        // } : {
        //   transform: 'translateX(-240px)',
        //   visibility: 'hidden'
        // }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        {
          drawer
        }
      </Drawer>
    </div>
    { page ?
      <div style={{position: "absolute", width: "100vw", height: "100vh", zIndex: 1201}}>
        <CancelIcon 
          style={{position: "absolute", top: "2rem", right: "2rem", fontSize: "2rem", cursor: "pointer", color: "white"}} 
          onClick={handleClose} 
        />
        {page}
      </div> : null
    }
    </>
  );
}

export default GameDrawer;
