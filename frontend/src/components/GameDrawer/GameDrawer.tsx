
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
      zIndex: 1201,
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
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };


  return (
    <div className={classes.root}>

      <div className={clsx(classes.sideBar, "text-center")}>
        <div className={classes.sideTop}>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerOpen}
          >
            <TextsmsIcon style={{color: "#fff", fontSize: '2rem'}} />
          </IconButton>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerOpen}
          >
            <PeopleAltIcon style={{color: "#fff", fontSize: '2rem'}} />
          </IconButton>
        </div>
        <div className={classes.sideBot}>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerOpen}
          >
            <SettingsIcon style={{color: "#fff", fontSize: '2rem'}} />
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
        <Chat />
      </Drawer>
    </div>
  );
}

export default GameDrawer;
