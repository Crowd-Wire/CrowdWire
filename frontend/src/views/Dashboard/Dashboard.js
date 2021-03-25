import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { MapOutlined, Public, Settings } from '@material-ui/icons';
import DashboardContent from 'views/Dashboard/sections/DashboardContent.js';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    backgroundColor: '#5BC0BE',
    height:'100%',width:'100%', overflow:"auto"
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    background: "#3A506B",
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    background: "#3A506B",
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(8) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),

    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  iconDrawer: {
    fill:"white"
  },
}));

export default function MiniDrawer() {
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
      <CssBaseline />

      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
        })}
        classes={{
            paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
            }),
        }}
      >
        <div className={classes.toolbar}
          className={clsx(classes.menuButton, {
          [classes.hide]: open,
          })}>
        <IconButton
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          className={clsx(classes.menuButton, {
            [classes.hide]: open,
          })}
        >
          <MenuIcon className={classes.iconDrawer}/>
        </IconButton>
        </div>
        <div className={classes.toolbar}
                  className={clsx(classes.menuButton, {
                    [classes.hide]: !open,
                  })}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon className={classes.iconDrawer}/>
          </IconButton>
        </div>
        <Divider />
        <List>
          {['My Worlds', 'Public Worlds'].map((text, index) => (
            <ListItem 
            button key={text}
            >
              <ListItemIcon>{index % 2 === 0 ? <MapOutlined className={classes.iconDrawer}/> : <Public className={classes.iconDrawer}/>}</ListItemIcon>
              <ListItemText style={{ color: '#FFFFFF' }} primary={text} />
            </ListItem>
          ))}
            <ListItem className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,})} button key={Settings} style={{position: "fixed", bottom: theme.spacing.unit * 2}}>
              <ListItemIcon>
                  <Settings className={classes.iconDrawer}/>
              </ListItemIcon>
              <ListItemText style={{ color: '#FFFFFF' }} primary="SETTINGS" className={classes.toolbar}
                  className={clsx(classes.menuButton, {
                    [classes.hide]: !open,
                  })}/>
            </ListItem>
        </List>
      </Drawer>
      <DashboardContent/>
      {/* <SearchAllMaps/> */}
    </div>
  );
}
