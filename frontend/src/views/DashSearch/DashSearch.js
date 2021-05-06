import React, { Component } from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import SearchAllMaps from 'views/DashSearch/sections/SearchAllMaps.js';
import DashDrawer from 'components/DashDrawer/DashDrawer.js';
import { withStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';

const useStyles = theme => ({
  root: {
    display: 'flex',
    backgroundColor: '#5BC0BE',
    height:'100%',width:'100%', overflow:"auto"
  },
});
class DashSearch extends Component {

  state={
    focus: false,
    joined:false,
    fMap: null
  };
  constructor(props){
    super(props);
  }


  handler(id){
    //navigate to designated world details
    const nav = useNavigate();
    nav("../"+id);
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
        <DashDrawer handler={this.sidebar_handler} changeAuth={this.props.changeAuth} isAuth={this.props.isAuth} />
          <SearchAllMaps handler = {this.handler} joined={this.state.joined} />
      </div>
    );
  };
}

export default withStyles(useStyles)(DashSearch);
