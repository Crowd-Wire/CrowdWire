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
import ReportService from 'services/ReportService';
import UserReportCard from 'components/UserReportCard/UserReportCard';
import Paginator from 'components/Paginator/Paginator.js';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        color: 'black'
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));


export default function UserReports() {
    const classes = useStyles();
    const [page, setPage] = React.useState(1);
    const [reports, setReports] = React.useState([]);
    const [orderBy, setOrderBy] = React.useState("");
    const [order, setOrder] = React.useState("");
    const [world, setWorld] = React.useState(null);
    const [reporter, setReporter] = React.useState(null);
    const [reported, setReported] = React.useState(null);
    const [reviewed, setReviewed] = React.useState(false);

    const numberRegex = /[0-9]+|^/;

    const limit = 10;

    const handleOrderBy = (event) => {
        setOrderBy(event.target.value);
    }

    const handleOrder = (event) => {
        setOrder(event.target.value);
    }

    const handleWorld = (event) => {
        let input = event.target.value;
        if (numberRegex.test(input))
            setWorld(event.target.value);
    }

    const handleReporter = (event) => {
        let input = event.target.value;
        if (numberRegex.test(input))
            setReporter(input);
    }
    const handleReported = (event) => {
        let input = event.target.value;
        if (numberRegex.test(input))
            setReported(input);
    }

    const handleReviewed = () => {
        setReviewed(!reviewed);
    }

    const handleSubmit = (newRequest) => {
        if (newRequest) {
            if (page !== 1)
                setPage(1);
            else
                request(world, reporter, reported, reviewed, orderBy, order, 1, limit);
        }
        request(world, reporter, reported, reviewed, orderBy, order, page, limit);
    }

    const request = (world_id, reporter_id, reported_id, reviewed, order_by, order, page, limit) => {
        ReportService.getReports(world_id, reporter_id, reported_id, reviewed, order_by, order, page, limit)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if(!res.detail){
                    setReports(res);
                }
                
            })
    }

    const changePage = (p) =>{
        setPage(p);
    }

    React.useEffect(() => {
        request(null, null, null, false, null, null, 1, limit);
    }, []);

    React.useEffect(() => {
        handleSubmit()
    }, [page]);

    return (
        <div style={{ paddingTop: '100px', width: '100%', height: '100%',
            position: 'absolute', paddingLeft: '100px', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)' }}>
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
            <Button onClick={() => { handleSubmit(1) }}>Search</Button>
            {reports && reports.length !== 0 ? reports.map((r, i) => {
                if( i !== limit)
                    return (<UserReportCard key={r.reporter + '_' + r.reported + '_' + r.world_id + '_' + r.reviewed}
                        report={r} />)

            }) : <h2 style={{paddingTop: 100, paddingBottom: 100}}>No reports found for this search...</h2>}
            <hr/>
            <Paginator hasNext={reports.length === limit + 1} page={page} changePage={(page) => { changePage(page) }} />
        </div>
    )
}
