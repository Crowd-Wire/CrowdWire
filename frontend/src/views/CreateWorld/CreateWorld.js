import React, { Component } from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import img from 'assets/img/bg8.png';
const useStyles = theme => ({
  root: {
    display: 'flex',
    backgroundImage: `url(${img})`,
    backgroundSize:"cover",
    height:'100%',width:'100%', overflow:"auto"
  },
});
class CreateWorld extends Component {
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
        <Row style={{width:"100%", marginLeft:"auto", marginRight:"auto", marginTop:"8%",marginBottom:"3%"}}>
            <Col xs={2} sm={1} md={1}>
            </Col>
            <Col xs={8} sm={6} md={5}>
                <div style={{height:"100%",width:"100%", borderRadius:"8px", backgroundColor:"white"}}>
                    <Row style={{height:"20px"}}></Row>
                    <Row style={{width:"100%", marginLeft:"auto", marginRight:"auto"}}>
                        <Typography variant="h5" style={{marginLeft:"auto", marginRight:"auto"}}>World Information</Typography>
                    </Row>
                    <br/>
                    <Row style={{width:"100%", marginLeft:"auto", marginRight:"auto", marginTop:"20px"}}>
                        <TextField id="outlined-basic" label="Name" style={{marginLeft:"30px"}}/>
                    </Row>
                    <Row style={{width:"100%", marginLeft:"auto", marginRight:"auto", marginTop:"20px"}}>
                        <Col style={{width:"100%", backgroundColor:"red"}}>
                            <Row style={{marginLeft:"30px", marginTop:"20px"}}>
                                <Typography>Accessibility</Typography>
                            </Row>
                            <Row style={{marginLeft:"30px", marginTop:"20px"}}>
                                <RadioGroup row>
                                    <FormControlLabel value="female" control={<Radio />} label="Private" />
                                    <FormControlLabel value="male" control={<Radio />} label="Public" />
                                </RadioGroup>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Col>
        </Row>
      </div>
    );
  };
}

export default withStyles(useStyles)(CreateWorld);