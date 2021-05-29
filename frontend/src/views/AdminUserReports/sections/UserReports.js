import React from 'react';
import { Checkbox } from '@material-ui/core';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { Row, Col, Button } from 'react-bootstrap';
import Input from '@material-ui/core/Input';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));


export default function UserReports() {
    const classes = useStyles();
    const [page, setPage] = React.useState("1");
    const [reports, setReports] = React.useState([]);
    const [orderBy, setOrderBy] = React.useState("");
    const [order, setOrder] = React.useState("");
    const [world, setWorld] = React.useState(null);
    const [reporter, setReporter] = React.useState(null);
    const [reported, setReported] = React.useState(null);

    const numberRegex = /[0-9]+|^/;


    const handleOrderBy = (event) => {
        setOrderBy(event.target.value);
    }

    const handleOrder = (event) => {
        setOrder(event.target.value);
    }

    const handleWorld = (event) =>{
        let input = event.target.value;
        if(numberRegex.test(input))      
            setWorld(event.target.value);
    }

    const handleReporter = (event) => {
        let input = event.target.value;
        if(numberRegex.test(input))      
            setReporter(input);
    }
    const handleReported = (event) => {
        let input = event.target.value;
        if(numberRegex.test(input))      
            setReported(input);
    }

    const handleSubmit = () => {
        console.log("submit");
    }


    return (
        <div style={{ marginTop: '100px' }}>
            <Input className="mx-3"
                type="number"
                id="world_id"
                placeholder="World Id"
                onChange={handleWorld}
            />
            <Input
                type="number"
                id="reporter_id"
                placeholder="Reporter Id"
                onChange={handleReporter}
            />

            <Input
                type="number"
                id="reported_id"
                placeholder="Reported Id"
                onChange={handleReported}
            />

            <FormControl className={classes.formControl}>
                <InputLabel id="orderBy-label">Order by</InputLabel>
                <Select
                    labelId="orderBy-label"
                    id="order_by"
                    value={orderBy}
                    onChange={handleOrderBy}
                    autoWidth
                >
                    <MenuItem value={"timestamp"}>Date</MenuItem>
                </Select>
            </FormControl>

            <FormControl className={classes.formControl}>
                <InputLabel id="order-label">Order</InputLabel>
                <Select
                    labelId="order-label"
                    id="order"
                    value={order}
                    onChange={handleOrder}
                    autoWidth
                >
                    <MenuItem value={"asc"}>Asc</MenuItem>
                    <MenuItem value={"desc"}>Desc</MenuItem>
                </Select>
            </FormControl>
            <Button onClick={handleSubmit}>Search</Button>


        </div>
    )
}
