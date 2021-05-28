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
    backgroundColor: '#5BC0BE',
    height:'100%',width:'100%', overflow:"auto"
  },
});

const DrawerLayout = (props) => {

  const { classes, ...rest } = props;
  const history = createBrowserHistory();
  const loc = useLocation();
  const [worldInfo, setWorldInfo] = React.useState("");

  const [focus, setFocus] = React.useState(false);
  const [joined, setJoined] = React.useState(false);
  const [fMap, setFMap] = React.useState(null);

  
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
