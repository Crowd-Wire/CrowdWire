import React from "react";

import { Outlet } from 'react-router-dom';

import Header from "components/Header/Header";
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import DashDrawer from 'components/DashDrawer/DashDrawer.js';

const useStyles = theme => ({
  root: {
    display: 'flex',
    height:'100%',
    width:'100%',
    overflow:"auto",
    backgroundImage: 'linear-gradient(to bottom right, #2B9BFD 4%, #71d1b9 90%)'
  },
});

const AdminLayout = (props) => {

  const { classes, ...rest } = props;

  const [joined, setJoined] = React.useState(false);

  const sidebar_handler = (joined) => {
    setJoined(joined);
  }

  return (
    <div  className={classes.root}  style={{paddingTop: 70}}>
      <CssBaseline />
      <Header
        absolute
        color="transparent"
        brand=""
        size="sm"
        {...rest}
      />
      <DashDrawer handler={sidebar_handler} changeAuth={props.changeAuth} />
      <Outlet />
    </div>
  );
}

export default withStyles(useStyles)(AdminLayout);