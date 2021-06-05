import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button"
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Autocomplete from '@material-ui/lab/Autocomplete';
import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import {
    DateTimePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';

const useStyles = makeStyles(theme => ({
    formControl: {
    margin: theme.spacing(1),
    minWidth: 120
    },
    selectEmpty: {
    marginTop: theme.spacing(2)
    }
}));

export default function EventFilters(props){

    const classes = useStyles();
    let worlds = props.worlds
    let ordering_list = ["Ascending", "Descending"]
    let event_types_helper = ["JOIN_PLAYER", "LEAVE_PLAYER", "JOIN_CONFERENCE", "LEAVE_CONFERENCE"]
    const [world, setWorld] = React.useState(1);
    const [eventstypes, setEventtypes] = useState(event_types_helper)
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(new Date());
    const [ordering,setOrdering] = useState("Descending")
    const inputLabel = React.useRef(null);
    const [labelWidth, setLabelWidth] = useState(0);
    React.useEffect(() => {
        setLabelWidth(inputLabel.current.offsetWidth);
        props.handler(
            eventstypes,world,startDate,endDate,ordering
        )
    }, []);
    const handleWorldIdChange = event => {
        setWorld(event.target.value);
    };
    const changeEventTypes = (value) => {
        setEventtypes(value)
    }
    const handleOrderingChange = event => {
        setOrdering(event.target.value)
    }
    return (
        <>
        <Row  style={{width:"100%"}}> 
        <Col style={{alignContent:"left"}}>
        <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel ref={inputLabel} id="demo-simple-select-outlined-label">
            Worlds
            </InputLabel>
            <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={world}
                onChange={handleWorldIdChange}
                labelWidth={labelWidth}
            >
            {worlds.map(item => (
                <MenuItem value={item.world_id}>{item.world_id}</MenuItem>
            ))}
        </Select>
        </FormControl>
        </Col>                                
            {worlds !== null ?
        <Col  xs={6} sm={6} md={6} style={{alignContent:"left"}}>
                        <Container size="large" >
                            <Autocomplete
                                limitTags={4}
            multiple
            value={eventstypes}
            onChange={(event, value) => changeEventTypes(value)}
                                id="tags-standard"
                                options={event_types_helper}
                                getOptionLabel={(option) => option}
                                renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="Event Types"
                                />
                                )}
                            />
                        </Container>
                </Col>
                :          
                <Col xs={6} sm={6} md={6}></Col>
        }
        <Col>
        <FormControl variant="outlined" className={classes.formControl}>
            <MuiPickersUtilsProvider  utils={DateFnsUtils}>
                <DateTimePicker label="Start Date" value={startDate} onChange={setStartDate} />
            </MuiPickersUtilsProvider>
            </FormControl>
        </Col>
        <Col>
        <FormControl variant="outlined" className={classes.formControl}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DateTimePicker label="End Date" value={endDate} onChange={setEndDate} />
            </MuiPickersUtilsProvider>
            </FormControl>
        </Col>
        <Col>
        <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel ref={inputLabel} id="ordering">
            Ordering
            </InputLabel>
            <Select
                labelId="ordering"
                id="ordering"
                value={ordering}
                onChange={handleOrderingChange}
                labelWidth={labelWidth}
            >
                {ordering_list.map(item => (
                    <MenuItem value={item}>{item}</MenuItem>
                ))}
                
        </Select>
        </FormControl>
        </Col>
        <Col><Button style= {{ marginTop:"20px"}} onClick = {()=> props.handler(
        eventstypes,world,startDate,endDate,ordering
        )} >Search</Button></Col>
        </Row>
        </>
    )
}