import React, { Component } from "react";
import { Link } from "react-router-dom";
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import WorldDetails from 'views/CreateWorld/sections/WorldDetails.js';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import img from 'assets/img/bg8.png';
import WorldService from 'services/WorldService.js';

import IconButton from '@material-ui/core/IconButton';const useStyles = theme => ({
  root: {
    display: 'flex',
    backgroundImage: `url(${img})`,
    backgroundSize:"cover",
    height:'100%',width:'100%', overflow:"auto"
  },
});
class CreateWorld extends Component {
  state={page:"details"};
  constructor(props){
    super(props);
  }


  createWorld = (wName, accessibility, guests, maxUsers, tag_array, desc) => {
    console.log(desc);
    if(accessibility){
      accessibility = true;
    }
    else{
      accessibility = false;
    }    
    if(guests){
      guests = true;
    }
    else{
      guests = false;
    }
    console.log(typeof guests, typeof accessibility);
    WorldService.create(wName, accessibility, guests, maxUsers, tag_array, desc)
    this.setState({
      page: "edit"
    });
  }


  render() {
    const { classes } = this.props;
    if(this.state.page==="details"){
      console.log("details");
      return(
        <div className={classes.root}>
          <CssBaseline />
          <Col style={{height:"100%"}}>
            <Row style={{height:"80px", marginLeft:"auto", marginRight:"auto"}}>
              <Col md={1}></Col>
              <Col>
                <Row style={{ height:"100%", marginLeft:"auto", marginRight:"auto"}}>
                  <Link to="/dashboard" style={{border:"black solid 1px",borderRadius:"10px",height:"50px", width:"50px", marginTop:"auto", marginBottom:"auto"}}>
                    <IconButton style={{border:"black solid 1px",borderRadius:"10px",height:"50px", width:"50px"}}>
                      <ArrowBackIcon style={{height:"40px", width:"40px", marginTop:"auto", color:"black", marginBottom:"auto"}}/>
                    </IconButton>
                  </Link>
                </Row>
              </Col>
            </Row>
            <Row style={{width:"100%", marginLeft:"auto", marginRight:"auto", marginBottom:"3%"}}>
                <WorldDetails createWorld={this.createWorld} />
            </Row>
          </Col>
        </div>
      );
    }
    else if(this.state.page==="edit"){
      return(<>Wrong2</>);
    }
    else{
      return(<>Wrong</>);
    }
  };
}

export default withStyles(useStyles)(CreateWorld);