import React, { Component } from "react";

import { Typography } from "@material-ui/core";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/lab/Autocomplete';
import 'bootstrap/dist/css/bootstrap.min.css';
import FormLabel from '@material-ui/core/FormLabel';

let wName = "";
let maxUsers = -1;
let tag_array = [];
let desc = "";
export default function WorldDetails(props){
    const { createWorld, ...other } = props;
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

    const [accessibility, setAccessibility] = React.useState(0);

    const creation = () => {
        if(wName){
            if(maxUsers && Number.isInteger(maxUsers) && maxUsers>=0){
                createWorld(wName, accessibility, maxUsers, tag_array, desc);
                return;
            }
            console.log("users nao é numero")
        }
        console.log(wName)
    }

    const onChangeValue = (event) => {
        setAccessibility(parseInt(event.target.value));
    }

    const onChangeTitle = (event) => {
        wName = event.target.value;
    }

    const onChangeMaxUsers = (event) => {
        maxUsers = event.target.value;
        
    }

    const onChangeDesc = (event) => {
        desc = event.target.value;
    }
    return(
        <Row style={{height:"100%", width:"100%"}}>
            <Col xs={2} sm={1} md={1}></Col>
            <Col xs={8} sm={5} md={5} style={{minWidth:"270px"}}>
                <div style={{height:"100%",width:"100%", borderRadius:"8px", backgroundColor:"white"}}>
                    <Row style={{height:"20px"}}/>
                    <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                        <Typography variant="h5" style={{marginLeft:"auto", marginRight:"auto"}}>World Details</Typography>
                    </Row>
                    <Row style={{marginLeft:"auto", marginRight:"auto", marginTop:"20px"}}>
                        <TextField id="outlined-basic" required onChange={onChangeTitle} label="Name" style={{maxWidth:"70%", marginLeft:"auto", marginRight:"auto"}}/>
                    </Row>
                    <Row style={{marginLeft:"auto", marginRight:"auto", marginTop:"30px"}}>
                        <div style={{width:"100%", marginLeft:"30px", marginRight:"auto"}}>
                        <FormLabel component="legend">Accessibility</FormLabel>
                            <RadioGroup row name="accessibility" onChange={onChangeValue}>
                            <FormControlLabel checked={accessibility === 0} value={0} control={<Radio />} label="Private" />
                            <FormControlLabel checked={accessibility === 1} value={1}  control={<Radio />} label="Public" />
                        </RadioGroup>
                        </div>
                    </Row>
                    <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                        <TextField
                        onChange={onChangeMaxUsers}
                            style={{marginLeft:"30px",marginRight:"auto"}}
                            id="standard-number"
                            label="Max Online Users"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Row>
                    <Row style={{marginLeft:"auto", marginTop:"10px", marginRight:"auto"}}>
                    <Autocomplete
                        limitTags={3}
                        style={{width:"90%", marginLeft:"30px",marginRight:"auto"}}
                        multiple
                        id="tags-standard"
                        onChange={(event, value) => tag_array = value}
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
                        onChange={onChangeDesc}
                        style={{width:"100%"}}
                        id="outlined-multiline-static"
                        multiline
                        rows={3}
                        placeholder="Description..."
                        variant="outlined"
                        />
                    </Row>
                    <Row style={{marginLeft:"30px", marginTop:"20px", marginRight:"30px", marginBottom:"30px"}}>
                        <Button onClick={creation} variant="contained" color="primary" style={{marginLeft:"auto", marginRight:"auto"}}>
                            Create Map
                        </Button>
                    </Row>
                </div>
            </Col>
        </Row>
    );
}