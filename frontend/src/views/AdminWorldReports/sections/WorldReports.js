import React from 'react';
import WorldReportCard from '../../../components/WorldReportCard/WorldReportCard.js';
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
        minWidth: 150,
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
    const [world, setWorld] = React.useState(null);
    const [reporter, setReporter] = React.useState(null);

    // matches positive integers and empty string
    const numberRegex = /[0-9]+|^/;

    const request = (world, reporter, reviewed, banned, order_by, order, page, limit) => {

        // this function verifies if any of these is null
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
        request(null, null, null, null, null, null, 1, null);
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
    }

    const handleReporter = (event) => {
        let input = event.target.value;
        if(numberRegex.test(input))      
            setReporter(input);
      
    }

    const handleSubmit = () => {
        request(world, reporter, reviewed, banned, orderBy, order, page, 10);
    }

    return (
        <div style={{ paddingTop: '80px', height:"100%"}}>
            <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                <Col md={4}>
                    <Input className="mx-3"
                        className={classes.formControl}
                        type="number"
                        id="world_search"
                        placeholder="World Id"
                        onChange={handleWorld}    
                    />
                    <Input 
                        className={classes.formControl}
                        type="number" 
                        id="reporter_search"
                        placeholder="Reporter Id"
                        onChange={handleReporter}
                    />

                </Col>
                <Col md={3}>
                    <FormControlLabel
                        className={classes.formControl}
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
                        className={classes.formControl}
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
                </Col>
                <Col md={3}>
                    <FormControl className={classes.formControl}>
                        <Select
                            labelId="orderBy-label"
                            id="order_by"
                            displayEmpty
                            value={orderBy}
                            onChange={handleOrderBy}
                            autoWidth
                        >
                            <MenuItem value={""}>
                                <em>OrderBy</em>
                            </MenuItem>
                            <MenuItem value={"timestamp"}>Date</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <Select
                            labelId="order-label"
                            id="order"
                            displayEmpty
                            value={order}
                            onChange={handleOrder}
                            autoWidth
                        >
                            <MenuItem value={""}><em>Order</em></MenuItem>
                            <MenuItem value={"asc"}>Asc</MenuItem>
                            <MenuItem value={"desc"}>Desc</MenuItem>
                        </Select>
                    </FormControl>
                </Col>
                <Col md={2}>
                    <Button onClick={handleSubmit}>Search</Button>
                </Col>
            </Row>
            <hr/>
            <div className="">
                <Row className="my-3" style={{marginLeft:"auto", marginRight:"auto"}}>
                {reports.map((r, i) => {
                    console.log(JSON.stringify(r));
                    return (
                        <Col md={4} sm={6}>
                            <WorldReportCard key={r.reported + '_' + r.reporter + '_' + r.reviewed} report={r} /> 
                        </Col>
                        )
                    })}
                </Row>
            </div>
        </div>
    )
}
