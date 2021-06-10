
import React, { useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Badge from '@material-ui/core/Badge';
import TextsmsIcon from '@material-ui/icons/Textsms';
import SettingsIcon from '@material-ui/icons/Settings';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import ReportIcon from '@material-ui/icons/Report';
import Chat from './Sections/Chat';
import UserList from './Sections/UserList.js';
import WSettingsContent from "views/WorldSettings/sections/WSettingsContent.js";
import { ReportWorldCard } from 'components/ReportWorldCard/ReportWorldCard'

import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import CancelIcon from '@material-ui/icons/Cancel';
import LinkIcon from '@material-ui/icons/Link';
import BuildIcon from '@material-ui/icons/Build';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import { Navigate, useNavigate } from "react-router-dom";

import GenerateInviteCard from "components/InGame/GenerateInviteCard.js";

import useMessageStore from 'stores/useMessageStore';
import useWorldUserStore from 'stores/useWorldUserStore';
import usePlayerStore from 'stores/usePlayerStore';
import useAuthStore from 'stores/useAuthStore';


const drawerWidth = 360;
const sideBarWidth = 65;

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
      backgroundColor: 'rgb(11, 19, 43)',
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
      //width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      paddingLeft: sideBarWidth,
      backgroundImage: 'linear-gradient(to bottom right, #2B9BFD 4%, #71d1b9 200%)',
    },
    drawerHeader: {
      display: 'flex',
      height: "64px",
      alignItems: 'center',
      "box-sizing": "border-box",
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
  const [open, setOpen] = React.useState(false);
  const [openReport, setOpenReport] = React.useState(false);
  const [fullScreen, setFullScreen] = React.useState(false);
  const [drawer, setDrawer] = React.useState(null);
  const [page, setPage] = React.useState(null);
  const [hasScroll, setHasScroll] = React.useState(false);
  const [numMessagesSeen, setNumMessagesSeen] = React.useState(0);
  const requestsToSpeak = usePlayerStore(state => state.requestsToSpeak);
  let numMessages = useMessageStore(state => state.messages.length);
  let textChat = document.getElementById('text-chat');;
  const navigation = useNavigate();

  useEffect(() => {
    console.log(useWorldUserStore.getState())
    if (!textChat) {
      textChat = document.getElementById('text-chat');
    } else {
      textChat.addEventListener('scroll', handleScroll);
      setHasScroll(textChat.scrollHeight > textChat.clientHeight);
    }

    return () => {
      if (textChat)
        textChat.removeEventListener('scroll', handleScroll);
    }
  })

  const leaveWorld = () => {
    navigation("/dashboard/search/public");
  }

  const handleOpenReport = () => {
    setOpenReport(true);
  };

  const handleCloseReport = () => {
    setOpenReport(false);
  };

  /**
   * Remove notifications when scroll to bottom
   */
  const handleScroll = () => {
    if (textChat.scrollTop === textChat.scrollHeight - textChat.clientHeight)
      setNumMessagesSeen(numMessages);
  }

  const handleDrawerOpen = (component) => {
    if (open && drawer && component && component.type === drawer.type) {
      setOpen(false);
    } else {
      setOpen(true);
      setDrawer(component);
      setPage(null);
    }
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleOpen = (component) => {
    if (page && component && component.type === page.type) {
      setPage(null);
    } else {
      setPage(component);
      setOpen(false);
    }
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

  const iconsStyle = {color: "#fff", fontSize: '1.8rem'};

  return (
    <>
    <div className={classes.root}>

      <div className={clsx(classes.sideBar, "text-center")}>
        <div className={classes.sideTop}>
          <IconButton
            aria-label="open drawer"
            onClick={() => {
              handleDrawerOpen(
                <Chat handleMessage={() => setNumMessagesSeen(n => n + 1)} />
              ); 
              setNumMessagesSeen(numMessages)}}
          >
            <Badge 
              badgeContent={(!hasScroll && drawer && drawer.type === 'Chat') || numMessagesSeen > numMessages ? 
                            0 : numMessages - numMessagesSeen} 
              color="secondary"
            >
              <TextsmsIcon style={iconsStyle} />
            </Badge>
          </IconButton>
          <IconButton
            aria-label="open drawer"
            onClick={() => handleDrawerOpen(<UserList />)}
          >
            <Badge badgeContent={requestsToSpeak} color="secondary">
              <PeopleAltIcon style={iconsStyle} />
            </Badge>
          </IconButton>
        </div>
        <div className={classes.sideBot}>
          { useWorldUserStore.getState().world_user.role.invite ?
            <IconButton
              aria-label="open drawer"
              onClick={() => handleOpen(<GenerateInviteCard />)}
            >
              <LinkIcon style={iconsStyle} />
            </IconButton>
            : null }
          <IconButton onClick={handleFullscreen}>
          { fullScreen ?
              <FullscreenExitIcon style={iconsStyle} />
            : <FullscreenIcon style={iconsStyle} />
          }
          </IconButton>
          { true ?
            <IconButton
              aria-label="open drawer"
              onClick={() => navigation(window.location.pathname + '/editor')}
            >
              <BuildIcon style={iconsStyle} />
            </IconButton>
            : null }
          { useWorldUserStore.getState().world_user.role.role_manage ? 
            <IconButton
              aria-label="open drawer"
              onClick={() => handleOpen(<WSettingsContent />)}
            >
              <SettingsIcon style={iconsStyle} />
            </IconButton>
            : null }
          { !useAuthStore.getState().guest_uuid ?
            <IconButton
              aria-label="open report modal"
              onClick={() => handleOpenReport()}
            >
              <ReportIcon style={iconsStyle} />
            </IconButton>
          : null }
          <IconButton
            onClick={() => leaveWorld()}
          >
            <MeetingRoomIcon style={iconsStyle} />
          </IconButton>
          
        </div>
      </div>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
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
      <div style={{position: "absolute", width: "100vw", height: "100vh", zIndex: 1201, paddingLeft: sideBarWidth, backgroundImage: 'linear-gradient(to bottom right, #2B9BFD 4%, #71d1b9 90%)',}}>
        <CancelIcon 
          style={{position: "absolute", top: "2rem", right: "2rem", fontSize: "2rem", cursor: "pointer", color: "white"}} 
          onClick={handleClose} 
        />
        {page}
      </div> : null
    }
    <ReportWorldCard open={openReport} closeModal={handleCloseReport} inside_world={true} />
    </>
  );
}

export default GameDrawer;
