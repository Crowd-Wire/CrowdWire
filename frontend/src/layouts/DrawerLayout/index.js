import React from "react";

import { Outlet } from 'react-router-dom';

import Header from "components/Header/Header";
import DashDrawer from 'components/DashDrawer/DashDrawer.js';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createBrowserHistory } from "history";
import { useLocation } from 'react-router-dom';

const useStyles = theme => ({
  root: {
    display: 'flex',
    height:'100%',
    width:'100%',
    overflow:"auto",
    backgroundColor: '#2B9BFD',
    backgroundImage: 'linear-gradient(to bottom right, #2B9BFD 4%, #71d1b9 90%)'
  },
});

const DrawerLayout = (props) => {

  const { classes, ...rest } = props;

  const [joined, setJoined] = React.useState(false);

  
  // handler = (id) => {
  //   //navigate to designated world details
  //   const nav = useNavigate();
  //   nav("../" + id);
  // }

  // const handler = () => {
  //   history.back();
  // }

  // handler to change the state of the SearchAllMaps component based on the sidebar
  const sidebar_handler = (joined) => {
    setJoined(joined);
  }

  return (
    <div className={classes.root}  style={{paddingTop: 70}}>
      <CssBaseline />
      <DashDrawer handler={sidebar_handler} changeAuth={props.changeAuth} />
      <Outlet joined={joined}/>
    </div>
  );
}

export default withStyles(useStyles)(DrawerLayout);
