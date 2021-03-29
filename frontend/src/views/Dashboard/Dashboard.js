import React, { Component } from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import SearchAllMaps from 'views/Dashboard/sections/SearchAllMaps.js';
import DashboardContent from 'views/Dashboard/sections/DashboardContent.js';
import DashDrawer from 'components/DashDrawer/DashDrawer.js';
import { withStyles } from '@material-ui/core/styles';


const useStyles = theme => ({
  root: {
    display: 'flex',
    backgroundColor: '#5BC0BE',
    height:'100%',width:'100%', overflow:"auto"
  },
});
class Dashboard extends Component {
  state={focus: false};
  constructor(props){
    super(props);
  }
  handler = (focused) => {
    this.setState({
      focus: focused
    });
  }
  unDo = () => {
    console.log("fez?");
    }

  render() {
    const { classes } = this.props;
    return(
      <div className={classes.root}>
        <CssBaseline />
        <DashDrawer/>
        {this.state.focus ? 
          <SearchAllMaps handler = {this.handler} />
          :
          <DashboardContent handler = {this.handler} />
        }
      </div>
    );
  };
}

export default withStyles(useStyles)(Dashboard);
