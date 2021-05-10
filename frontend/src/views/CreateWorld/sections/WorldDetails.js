import React, { Component, useEffect } from "react";

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
import TagService from 'services/TagService';
import useAuthStore from 'stores/useAuthStore.ts';
let wName = "";
let maxUsers = -1;
let tag_array = [];
let desc = "";
export default function WorldDetails(props){
    const { createWorld, ...other } = props;
    const [tags,setTags] = React.useState([]);
    const [error, setError] = React.useState(-1);
    useEffect (() => {
        TagService.getAll()
                .then((res) => {return res.json()})
                .then((res) => {
            let arr = [];
            res.forEach(tag => arr.push(tag.name)); 
            setTags(arr);
          }).catch((error) => {useAuthStore.getState().leave()})
      }, [])

    const [accessibility, setAccessibility] = React.useState("false");
    const [guests, setGuests] = React.useState("false");
    const [titleHelper, settitleHelper] = React.useState("");
    const [maxUsersHelper, setMaxUsersHelper] = React.useState("");
    const [descHelper, setDescHelper] = React.useState("");
    const creation = () => {
        let send = true;
        maxUsers = parseInt(maxUsers)
        if(!wName){
            send=false;
            settitleHelper("Title is mandatory");}
        else if( wName.length>30){
            send=false;
            settitleHelper("Title is too big (30)");}
        else
            settitleHelper("");
        if(!maxUsers){
            send=false;
            setMaxUsersHelper("Max users is mandatory");}
        else if(!Number.isInteger(maxUsers) || maxUsers<=0){
            send=false;
            setMaxUsersHelper("Max users must be positive integer");}
        else
            setMaxUsersHelper("");

        if(desc.length>300){
            send=false;
            setDescHelper("Description is too big (300)");
        }
        else
            setDescHelper("");
        if(send){
            createWorld(wName, accessibility, guests, maxUsers, tag_array, desc);
        }
    }

    const onChangeValue = (event) => {
        setAccessibility(event.target.value);
    }

    const onChangeGuests = (event) => {
        setGuests(event.target.value);
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
                            <TextField 
                                error={error===2} 
                                id="outlined-basic"
                                helperText={titleHelper}
                                required 
                                onChange={onChangeTitle} 
                                label="Name" 
                                style={{maxWidth:"70%", marginLeft:"auto", marginRight:"auto"}}
                            />

                    </Row>
                    <Row style={{marginLeft:"auto", marginRight:"auto", marginTop:"30px"}}>
                        <Col>
                            <div style={{width:"100%", marginLeft:"30px", marginRight:"auto"}}>
                            <FormLabel component="legend">Accessibility</FormLabel>
                                <RadioGroup row name="accessibility" onChange={onChangeValue}>
                                <FormControlLabel checked={accessibility === "false"} value={"false"} control={<Radio />} label="Private" />
                                <FormControlLabel checked={accessibility === "true"} value={"true"}  control={<Radio />} label="Public" />
                            </RadioGroup>
                            </div>
                        </Col>
                        <Col>
                            <div style={{width:"100%", marginRight:"auto"}}>
                            <FormLabel component="legend">Allow guests</FormLabel>
                                <RadioGroup row name="guests" onChange={onChangeGuests}>
                                <FormControlLabel checked={guests === "false"} value={"false"} control={<Radio />} label="Allow" />
                                <FormControlLabel checked={guests === "true"} value={"true"}  control={<Radio />} label="Deny" />
                            </RadioGroup>
                            </div>
                        </Col>
                    </Row>
                    <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                        <Col xs={7} sm={7} md={7}>
                            <Autocomplete
                                limitTags={2}
                                style={{marginLeft:"30px", width:"90%",marginRight:"auto"}}
                                multiple
                                id="tags-standard"
                                onChange={(event, value) => tag_array = value}
                                options={tags}
                                getOptionLabel={(option) => option}
                                renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="Tags"
                                />
                                )}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={5}>
                            <TextField
                                onChange={onChangeMaxUsers}
                                error={error===1}
                                helperText={maxUsersHelper}
                                style={{marginRight:"30px"}}
                                id="standard-number"
                                label="Max Online Users*"
                                type="number"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Col>
                    </Row>
                    <Row style={{marginLeft:"30px", marginTop:"20px", marginRight:"30px"}}>
                        <TextField
                        onChange={onChangeDesc}
                        error={error===0}
                        helperText={descHelper}
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