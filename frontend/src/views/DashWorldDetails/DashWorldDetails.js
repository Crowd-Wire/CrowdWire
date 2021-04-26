import React, { Component } from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import DashboardContent from 'views/DashWorldDetails/sections/DashboardContent.js';
import DashDrawer from 'components/DashDrawer/DashDrawer.js';
import WorldService from 'services/WorldService.js';
import { withStyles } from '@material-ui/core/styles';
import { useLocation, useNavigate } from 'react-router-dom'

const useStyles = theme => ({
  root: {
    display: 'flex',
    backgroundColor: '#5BC0BE',
    height:'100%',width:'100%', overflow:"auto"
  },
});

class DashWorldDetails extends Component {

  state={
    focus: false,
    joined:false,
    fMap: null
  };
  constructor(props){
    super(props);
    this.details = WorldService.getWorldDetails(this.props.path);
  }

  getLocation(){
    return useLocation();
  }

  handler = (focused) => {
      //NAVIGATE BACK TO DASHBOARD
    this.setState({
      focus: focused,
      fMap: null
    });
  }

  // handler to change the state of the SearchAllMaps component based on the sidebar
  sidebar_handler = (joined) => {
    this.setState({
      joined: joined
    });
  }

  render() {
    const { classes } = this.props;
    return(
      <div className={classes.root}>
        <CssBaseline />
        <DashDrawer handler={this.sidebar_handler}/>
          <DashboardContent handler = {this.handler} worldInfo={this.details} />
      </div>
    );
  };
}

export default withStyles(useStyles)(DashWorldDetails);
