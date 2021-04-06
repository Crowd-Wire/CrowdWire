import React, { Component } from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import DashDrawer from 'components/DashDrawer/DashDrawer.js';
import { withStyles } from '@material-ui/core/styles';
import WSettingsContent from 'views/WorldSettings/sections/WSettingsContent.js';

const useStyles = theme => ({
  root: {
    display: 'flex',
    backgroundColor: '#1C2541',
    height:'100%',width:'100%', overflow:"auto"
  },
});
class WorldSettings extends Component {
  state={focus: false};
  constructor(props){
    super(props);
  }
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
