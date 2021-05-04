import React, { useEffect } from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import DashboardContent from 'views/DashWorldDetails/sections/DashboardContent.js';
import DashDrawer from 'components/DashDrawer/DashDrawer.js';
import WorldService from 'services/WorldService.js';
import { makeStyles } from '@material-ui/core/styles';
import { useLocation, useNavigate } from 'react-router-dom'
import { createBrowserHistory } from 'history';
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        backgroundColor: '#5BC0BE',
        height:'100%',width:'100%', overflow:"auto"
    },  
}));

export default function DashWorldDetails(){
  const classes = useStyles();
  const history = createBrowserHistory();
  const loc = useLocation();
  const [worldInfo, setWorldInfo] = React.useState("");
  useEffect (() => {
    WorldService.getWorldDetails(loc.pathname)
    .then((res) => {
      if(res.status == 200) 
        return res.json()
    })
    .then((res) => {
      if(res)
        setWorldInfo(res)
    });
  }, [])
  const handler = () => {
      history.back();
  }
  const [joined,setJoined] = React.useState(false);
  // handler to change the state of the SearchAllMaps component based on the sidebar
  const sidebar_handler = (joined) => {
    this.setJoined(false);
  }
return(
    <div className={classes.root}>
        <CssBaseline />
        <DashDrawer handler={sidebar_handler}/>
        <DashboardContent handler = {handler} worldInfo={worldInfo} />
    </div>
    );
  };

