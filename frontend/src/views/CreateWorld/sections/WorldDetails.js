import React, { Component } from "react";

import { Typography } from "@material-ui/core";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
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
import Autocomplete from '@material-ui/lab/Autocomplete';import 'bootstrap/dist/css/bootstrap.min.css';

export default function WorldDetails(props){
    const { changePage, ...other } = props;
    const allLabels=[
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
    ];
    return(
        <Row style={{height:"100%", width:"100%"}}>
            <Col xs={2} sm={1} md={1}></Col>
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
                        options={allLabels}
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
                        <Button onClick={changePage} variant="contained" color="primary" style={{marginLeft:"auto", marginRight:"auto"}}>
                            Create Map
                        </Button>
                    </Row>
                </div>
            </Col>
        </Row>
    );
}