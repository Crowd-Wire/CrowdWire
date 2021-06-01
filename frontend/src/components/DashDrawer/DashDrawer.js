import React, { useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { AddCircleOutlined, Explore, Public, Settings } from '@material-ui/icons';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import { useLocation, useNavigate } from "react-router-dom";
import AuthenticationService from "services/AuthenticationService.js";
import useAuthStore from "stores/useAuthStore.ts";
import created_worlds from "assets/img/save-the-planet.svg";
import UserService from "services/UserService.js";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
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
    overflowX: 'hidden',
    background: "rgba(11, 19, 43, 1)",
    // backgroundImage: "url('https://img.freepik.com/free-photo/abstract-grunge-decorative-relief-navy-blue-stucco-wall-texture-wide-angle-rough-colored-background_1258-28311.jpg?size=626&ext=jpg&ga=GA1.2.1448789384.1622332800')",
    // backgroundSize: 'cover',
    // backgroundRepeat: 'repeat-y',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    background: "rgba(11, 19, 43, 1)",
    // backgroundImage: "url('https://img.freepik.com/free-photo/abstract-grunge-decorative-relief-navy-blue-stucco-wall-texture-wide-angle-rough-colored-background_1258-28311.jpg?size=626&ext=jpg&ga=GA1.2.1448789384.1622332800')",
    // backgroundSize: 'cover',
    // backgroundRepeat: 'repeat-y',
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
    fill:"white",
  },
}));

export default function DashDrawer(props){
  const st = useAuthStore.getState();
  const navigation = useNavigate();
  const location = useLocation();
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const addWorld = theme.spacing(2)+100;
  const definitions = theme.spacing(2)+50;
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const onClickAllWorlds = () => {
    if(location.pathname!=="/dashboard/search/public")
      navigation("/dashboard/search/public");
  }

  const onClickJoinedWorlds = () => {
    if(location.pathname!=="/dashboard/search/joined")
      navigation("/dashboard/search/joined");
  }

  const logout = () => {
    AuthenticationService.logout();
  }

  const onClickCreateWorld = () => {
    navigation("/create-world");
  }
  const onClickCreatedWorlds = () => {
    if(location.pathname!=="/dashboard/search/owned")
      navigation("/dashboard/search/owned");
  }

  const handleDrawerClose = () => {
    setOpen(false);
  };
    return(
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
            <ListItem button key='Public Worlds' onClick={onClickAllWorlds}
            className={clsx(classes.drawer, {[classes.drawerOpen]: open,[classes.drawerClose]: !open,})}>
              <ListItemIcon>
                <Explore className={classes.iconDrawer}/>
              </ListItemIcon>
              <ListItemText style={{ color: '#FFFFFF' }} primary='Public Worlds' className={classes.toolbar}
                    className={clsx(classes.menuButton, {
                        [classes.hide]: !open,
                    })}/>
            </ListItem>
          {st.guest_uuid ? <></> :
            <ListItem button key='Joined Worlds' onClick={onClickJoinedWorlds} className={clsx(classes.drawer, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,})}>
              <ListItemIcon>
                <Public className={classes.iconDrawer}/>
              </ListItemIcon>
              <ListItemText style={{ color: '#FFFFFF' }} primary='Joined Worlds' className={classes.toolbar}
                    className={clsx(classes.menuButton, {
                        [classes.hide]: !open,
                    })}/>
            </ListItem>
          }
          {st.guest_uuid ? <></> :
            <ListItem button key='Created Worlds' onClick={onClickCreatedWorlds} className={clsx(classes.drawer, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,})}>
              <ListItemIcon>
                <img src={created_worlds} className={classes.iconDrawer} style={{height:"25px", width:"25px"}}/>
              </ListItemIcon>
              <ListItemText style={{ color: '#FFFFFF' }} primary='Created Worlds' className={classes.toolbar}
                    className={clsx(classes.menuButton, {
                        [classes.hide]: !open,
                    })}/>
            </ListItem>
          }
          { st.guest_uuid ?
            <></>
            :
            <ListItem className={clsx(classes.drawer, {[classes.drawerOpen]: open,[classes.drawerClose]: !open,})} button key="Create World" style={{position: "fixed", bottom: addWorld}}
            onClick={onClickCreateWorld}>
              <ListItemIcon>
                  <AddCircleOutlined className={classes.iconDrawer}/>
              </ListItemIcon>
              <ListItemText style={{ color: '#FFFFFF' }} primary="CREATE WORLD" className={classes.toolbar}
                  className={clsx(classes.menuButton, {
                      [classes.hide]: !open,
                  })}/>
            </ListItem>
          }
          <ListItem className={clsx(classes.drawer, {[classes.drawerOpen]: open,[classes.drawerClose]: !open,})}
            button key="Settings" style={{position: "fixed", bottom: definitions}}>
          <ListItemIcon>
              <Settings className={classes.iconDrawer}/>
          </ListItemIcon>
          <ListItemText style={{ color: '#FFFFFF' }} primary="SETTINGS"
            className={clsx(classes.menuButton, {[classes.hide]: !open,})}/>
          </ListItem>
          <ListItem className={clsx(classes.drawer, {[classes.drawerOpen]: open,[classes.drawerClose]: !open,})}
            button key="Leave" style={{position: "fixed", bottom: theme.spacing(2)}}
            onClick={() => logout()}
          >
          <ListItemIcon>
              <MeetingRoomIcon className={classes.iconDrawer}/>
          </ListItemIcon>
          <ListItemText style={{ color: '#FFFFFF' }} primary="LOGOUT"
            className={clsx(classes.menuButton, {[classes.hide]: !open,})}/>
          </ListItem>
        </List>
      </Drawer>
    );
}