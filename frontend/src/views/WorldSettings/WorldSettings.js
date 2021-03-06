import React, { Component } from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import DashDrawer from 'components/DashDrawer/DashDrawer.js';
import { withStyles } from '@material-ui/core/styles';
import WSettingsContent from 'views/WorldSettings/sections/WSettingsContent.js';

const useStyles = theme => ({
  root: {
    display: 'flex',
    backgroundImage: 'linear-gradient(to bottom right, #2B9BFD 4%, #71d1b9 90%)',
    height:'100%',width:'100%', overflow:"auto"
  },
});
class WorldSettings extends Component {
  state={focus: false};

  handler = (focused) => {
    this.setState({
      focus: focused
    });
  }

  render() {
    const { classes } = this.props;
    return(
      <div className={classes.root}>
        <CssBaseline />
        <DashDrawer/>
        <WSettingsContent/>
      </div>
    );
  };
}

export default withStyles(useStyles)(WorldSettings);
