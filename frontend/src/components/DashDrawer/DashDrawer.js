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
import EqualizerIcon from '@material-ui/icons/Equalizer';
import userStats from "assets/img/polling.svg";
import ReportIcon from '@material-ui/icons/Report';
import DashboardIcon from '@material-ui/icons/Dashboard';
import Popover from "@material-ui/core/Popover";
import Row from "react-bootstrap/Row";
import MapIcon from '@material-ui/icons/Map';
import PersonIcon from '@material-ui/icons/Person';

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
  const stats = theme.spacing(2)+200;
  const userstats = theme.spacing(2)+150;
  const dashboard = theme.spacing(2)+250;
  const [anchorElUsers, setAnchorElUsers] = React.useState(null);
  const [anchorElWorlds, setAnchorElWorlds] = React.useState(null);

  const pop_open_users = Boolean(anchorElUsers);
  const pop_id_users = pop_open_users ? 'right-popover' : undefined;

  const handlePopClickUsers = (event) => {
    setAnchorElUsers(event.currentTarget);
  };

  const handlePopCloseUsers = () => {
    setAnchorElUsers(null);
  };

  const pop_open_worlds = Boolean(anchorElWorlds);
  const pop_id_worlds = pop_open_worlds ? 'right-popover' : undefined;

  const handlePopClickWorlds = (event) => {
    setAnchorElWorlds(event.currentTarget);
  };

  const handlePopCloseWorlds = () => {
    setAnchorElWorlds(null);
  };

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
    if(location.pathname!=="/create-world")
    navigation("/create-world");
  }
  const onClickCreatedWorlds = () => {
    if(location.pathname!=="/dashboard/search/owned")
      navigation("/dashboard/search/owned");
  }
  const onClickUserSettings = () => {
    if(location.pathname!=="/dashboard/user")
      navigation("/dashboard/user");
  }

  const onClickPlatformWorldStats = () => {
    handlePopCloseWorlds()
    if(location.pathname!=="/admin/worlds")
      navigation("/admin/worlds");
  }

  const onClickPlatformWorldReports = () => {
    handlePopCloseWorlds()
    if(location.pathname!=="/admin/worlds/reports")
      navigation("/admin/worlds/reports");
  }

  const onClickPlatformUserStats = () => {
    handlePopCloseUsers()
    if(location.pathname!=="/admin/users")
      navigation("/admin/users");
  }

  const onClickPlatformUserReports = () => {
    handlePopCloseUsers()
    if(location.pathname!=="/admin/users/reports")
      navigation("/admin/users/reports");
  }

  const onClickPlatformDashboard = () => {
    if(location.pathname!=="/admin/dashboard")
      navigation("/admin/dashboard");
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

          { !st.is_superuser ?
            <></>
            :
            <>
              <ListItem onClick={onClickPlatformDashboard} className={clsx(classes.drawer, {[classes.drawerOpen]: open,[classes.drawerClose]: !open,})}
                button key="Admin Dashboard" style={{position: "fixed", bottom: dashboard}}>
              <ListItemIcon>
                <DashboardIcon className={classes.iconDrawer}/>
              </ListItemIcon>
              <ListItemText style={{ color: '#FFFFFF' }} primary="DASHBOARD"
                className={clsx(classes.menuButton, {[classes.hide]: !open,})}/>
              </ListItem>


              <ListItem onClick={handlePopClickWorlds} className={clsx(classes.drawer, {[classes.drawerOpen]: open,[classes.drawerClose]: !open,})}
                button key="Platform World Statistics" style={{position: "fixed", bottom: stats}}>
              <ListItemIcon>
                  <MapIcon className={classes.iconDrawer}/>
              </ListItemIcon>
              <ListItemText style={{ color: '#FFFFFF' }} primary="WORLD"
                className={clsx(classes.menuButton, {[classes.hide]: !open,})}/>
              </ListItem>

              <Popover
                id={pop_id_worlds}
                open={pop_open_worlds}
                anchorEl={anchorElWorlds}
                onClose={handlePopCloseWorlds}
                anchorOrigin={{
                  vertical: "center",
                  horizontal: "right"
                }}
                transformOrigin={{
                  vertical: "center",
                  horizontal: "left"
                }}
              >
                <>
                  <Row style={{width: 210, background: 'rgb(12 19 43)', paddingLeft: 15}}>
                    <ListItem onClick={onClickPlatformWorldStats} button key="Pop Platform World Statistics">
                      <ListItemIcon>
                        <EqualizerIcon className={classes.iconDrawer} style={{height:"23px", width:"23px"}}/>
                      </ListItemIcon>
                      <ListItemText style={{ color: '#FFFFFF' }} primary="STATISTICS" />
                    </ListItem>
                  </Row>
                  <Row style={{width: 200, background: 'rgb(12 19 43)', paddingLeft: 15}}>
                    <ListItem onClick={onClickPlatformWorldReports} button key="Pop Platform World Reports">
                      <ListItemIcon>
                        <ReportIcon className={classes.iconDrawer} style={{height:"23px", width:"23px"}}/>
                      </ListItemIcon>
                      <ListItemText style={{ color: '#FFFFFF' }} primary="REPORTS" />
                    </ListItem>
                  </Row>
                </>
              </Popover>

              <ListItem onClick={handlePopClickUsers} className={clsx(classes.drawer, {[classes.drawerOpen]: open,[classes.drawerClose]: !open,})}
                button key="Platform User Statistics" style={{position: "fixed", bottom: userstats}}>
              <ListItemIcon>
                <PersonIcon className={classes.iconDrawer}/>
              </ListItemIcon>
              <ListItemText style={{ color: '#FFFFFF' }} primary="USER"
                className={clsx(classes.menuButton, {[classes.hide]: !open,})}/>
              </ListItem>

              <Popover
                id={pop_id_users}
                open={pop_open_users}
                anchorEl={anchorElUsers}
                onClose={handlePopCloseUsers}
                anchorOrigin={{
                  vertical: "center",
                  horizontal: "right"
                }}
                transformOrigin={{
                  vertical: "center",
                  horizontal: "left"
                }}
              >
                <>
                  <Row style={{width: 210, background: 'rgb(12 19 43)', paddingLeft: 15}}>
                    <ListItem onClick={onClickPlatformUserStats} button key="Pop Platform User Statistics">
                      <ListItemIcon>
                          <EqualizerIcon className={classes.iconDrawer} style={{height:"23px", width:"23px"}}/>
                      </ListItemIcon>
                      <ListItemText style={{ color: '#FFFFFF' }} primary="STATISTICS" />
                    </ListItem>
                  </Row>
                  <Row style={{width: 200, background: 'rgb(12 19 43)', paddingLeft: 15}}>
                    <ListItem onClick={onClickPlatformUserReports} button key="Pop Platform User Reports">
                    <ListItemIcon>
                      <ReportIcon className={classes.iconDrawer} style={{height:"23px", width:"23px"}}/>
                    </ListItemIcon>
                    <ListItemText style={{ color: '#FFFFFF' }} primary="REPORTS" />
                    </ListItem>
                  </Row>
                </>
              </Popover>
            </>
          }
          { st.guest_uuid ?
            <></>
            :
          <ListItem onClick={onClickUserSettings} className={clsx(classes.drawer, {[classes.drawerOpen]: open,[classes.drawerClose]: !open,})}
            button key="Settings" style={{position: "fixed", bottom: definitions}}>
          <ListItemIcon>
              <Settings className={classes.iconDrawer}/>
          </ListItemIcon>
          <ListItemText style={{ color: '#FFFFFF' }} primary="SETTINGS"
            className={clsx(classes.menuButton, {[classes.hide]: !open,})}/>
          </ListItem>
          }



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