import React from 'react';
import WorldReportCard from './WorldReportCard.js';
import WorldService from '../../../services/WorldService.js';
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

export default function WorldReports(props) {

    const classes = useStyles();
    const [page, setPage] = React.useState("1");
    const [reports, setReports] = React.useState([]);
    const [orderBy, setOrderBy] = React.useState("");
    const [order, setOrder] = React.useState("");
    const [banned, setBanned] = React.useState(false);
    const [reviewed, setReviewed] = React.useState(false);
    const [world, setWorld] = React.useState(undefined);
    const [reporter, setReporter] = React.useState(undefined);

    // matches positive integers and empty string
    const numberRegex = /[0-9]+|^/;

    const request = (world, reporter, reviewed, banned, order_by, order, page, limit) => {

        // this function verifies if any of these is undefined
        WorldService.getAllReports(
            world, reporter, reviewed, banned, order_by, order, page, limit
        )
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                console.log(res);
                setReports(res);
            })
    }

    React.useEffect(() => {
        // this will call the function with page=1
        // limit is also an option but shouldnt be used because it can complicate the css
        request(undefined, undefined, undefined, undefined, undefined, undefined, 1, undefined);
    }, []);

    const handleOrderBy = (event) => {
        setOrderBy(event.target.value);
    };

    const handleOrder = (event) => {
        setOrder(event.target.value);
    }

    const handleBanned = (event) => {
        setBanned(!banned);
    }

    const handleReviewed = (event) => {
        setReviewed(!reviewed);
    }

    const handleWorld = (event) =>{
        let input = event.target.value;
        if(numberRegex.test(input))      
            setWorld(event.target.value);
        else
            console.log("that is not a number");
    }

    const handleReporter = (event) => {
        let input = event.target.value;
        console.log(input)
        if(numberRegex.test(input))      
            setReporter(input);
        else
            console.log("that is not a number");
    }

    const handleSubmit = () => {
        request(world, reporter, reviewed, banned, orderBy, order, page, 10);
    }

    return (
        <div style={{ marginTop: '100px' }}>
            <Row>
                <Col>
                {/*
                    <TextField className="mx-2"
                    id="world_search" label="World Id" type="search" variant="outlined" type="number"
                    />

                    <TextField
                    id="reporter_search" label="Reporter Id" type="search" variant="outlined" type="number"
                    />
                */}
                    <Input style={{size:"small"}} className="mx-3"
                        type="number"
                        id="world_search"
                        placeholder="World Id"
                        onChange={handleWorld}    
                    />
                    <Input 
                        type="number" 
                        id="reporter_search"
                        placeholder="Reporter Id"
                        onChange={handleReporter}
                    />

                </Col>
                <Col>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={reviewed}
                                onChange={handleReviewed}
                                name="reviewed"
                                color="primary"
                            />
                        }
                        label="Show Reviewed"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={banned}
                                onChange={handleBanned}
                                name="banned"
                                color="primary"
                            />
                        }
                        label="Show Banned"
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
                </Col>
            </Row>
            <Row className="my-2">
                <Col md="3">
                    <Button onClick={handleSubmit}>Search</Button>
                </Col>
            </Row>
            <hr/>
            <div className="">
                {reports.map((r, i) => {
                    return (<Row className="my-3"><Col></Col>
                        <Col><WorldReportCard key={i} report={r} reset={() => request(1)}/> </Col>
                        <Col></Col>
                        </Row>)
                })}
            </div>
        </div>
    )
}
