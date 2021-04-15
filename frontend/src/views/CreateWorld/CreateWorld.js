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
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/lab/Autocomplete';
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
  allLabels=[
    {name:"Classes"},
    {name:"Meetings"},
    {name:"Leisure"},
    {name:"Conferences"},
    {name:"Biology"},
    {name:"Physics"},
    {name:"Philosophy"},
    {name:"Medicine"},
    {name:"Maths"},
    {name:"Sociology"},
    {name:"Literature"},
  ]
  handler = (focused) => {
    this.setState({
      focus: focused
    });
  }
  handleChange = (event) => {
    const name = event.target.name;
    // this.setState({
    //   ...state,
    //   [name]: event.target.value,
    // });
  };

  render() {
    const { classes } = this.props;
    return(
      <div className={classes.root}>
        <CssBaseline />
        <Col style={{height:"100%"}}>
          <Row style={{width:"100%", height:"80px", backgroundColor:"red", marginLeft:"auto", marginRight:"auto"}}/>
          <Row style={{width:"100%", marginLeft:"auto", marginRight:"auto", marginBottom:"3%"}}>
              <Col xs={2} sm={1} md={1}>
              </Col>
              <Col xs={8} sm={5} md={5} style={{minWidth:"270px"}}>
                  <div style={{height:"100%",width:"100%", borderRadius:"8px", backgroundColor:"white"}}>
                      <Row style={{height:"20px"}}/>
                      <Row style={{width:"100%", marginLeft:"auto", marginRight:"auto"}}>
                          <Typography variant="h5" style={{marginLeft:"auto", marginRight:"auto"}}>World Details</Typography>
                      </Row>
                      <br/>
                      <Row style={{width:"100%", marginLeft:"auto", marginRight:"auto", marginTop:"20px"}}>
                          <TextField id="outlined-basic" label="Name" style={{maxWidth:"70%", marginLeft:"auto", marginRight:"auto"}}/>
                      </Row>
                      <Row style={{width:"100%", marginLeft:"auto", marginRight:"auto", marginTop:"20px"}}>
                          <Col style={{width:"100%"}}>
                              <Row style={{marginLeft:"30px", marginTop:"20px"}}>
                              </Row>
                              <Row style={{marginLeft:"auto", marginRight:"auto", marginTop:"20px"}}>
                                <div style={{marginLeft:"auto", marginRight:"auto"}}>
                                  <Typography style={{marginTop:"auto", marginBottom:"auto"}}>Accessibility</Typography>
                                  <RadioGroup row style={{marginTop:"auto", marginBottom:"auto"}}>
                                      <FormControlLabel value="female" style={{margin:"auto"}} control={<Radio />} label="Private" />
                                      <FormControlLabel value="male" style={{margin:"auto"}} control={<Radio />} label="Public" />
                                  </RadioGroup>
                                </div>
                              </Row>
                          </Col>
                      </Row>
                      <Row style={{marginLeft:"30px", marginTop:"20px", marginRight:"30px"}}>
                      <Autocomplete
                        limitTags={3}
                        style={{width:"90%", marginLeft:"auto",marginRight:"auto"}}
                        multiple
                        id="tags-standard"
                        options={this.allLabels}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Labels"
                          />
                        )}
                      />
                      </Row>
                      <Row style={{marginLeft:"30px", marginTop:"20px", marginRight:"30px"}}>
                        <TextField
                          style={{width:"100%"}}
                          id="outlined-multiline-static"
                          multiline
                          rows={3}
                          placeholder="Description..."
                          variant="outlined"
                        />
                      </Row>
                      <Row style={{marginLeft:"30px", marginTop:"20px", marginRight:"30px", marginBottom:"30px"}}>
                        <Button variant="contained" color="primary" style={{marginLeft:"auto", marginRight:"auto"}}
                        >
                          Create Map
                        </Button>
                      </Row>
                  </div>
              </Col>
          </Row>
        </Col>
      </div>
    );
  };
}

export default withStyles(useStyles)(CreateWorld);