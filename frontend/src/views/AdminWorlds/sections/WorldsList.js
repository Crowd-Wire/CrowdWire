import React from 'react';
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
import MapCard from 'components/MapCard/MapCard.js';
import Typography from '@material-ui/core/Typography';
import Pagination from '@material-ui/lab/Pagination';



const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export default function WorldsList() {
    const classes = useStyles();

    const [world, setWorld] = React.useState("");
    const [creator, setCreator] = React.useState(null);
    const [normal, setNormal] = React.useState(true);
    const [banned, setBanned] = React.useState(false);
    const [deleted, setDeleted] = React.useState(false);
    const [orderBy, setOrderBy] = React.useState("timestamp");
    const [order, setOrder] = React.useState("desc");
    const [page, setPage] = React.useState(1);

    const [worlds, setWorlds] = React.useState([]);


    const handleWorld = (event) => {
        setWorld(event.target.value);
    }

    const handleCreator = (event) => {
        setCreator(event.target.value);
    }

    // check if this the best solution
    const handleNormal = () => {
        setNormal(!normal);
    }

    const handleBanned = () => {
        setBanned(!banned);
    }

    const handleDeleted = () => {
        setDeleted(!deleted);
    }

    const handleOrderBy = (event) => {
        setOrderBy(event.target.value);
    }

    const handleOrder = (event) => {
        setOrder(event.target.value);
    }

    const request = (search, tags, visibility, banned, deleted, normal, creator, order_by, order, page, limit) => {
        WorldService.search(search, [], visibility, banned, deleted, normal, creator, order_by, order, page, limit)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                setWorlds(res);
            })
    }


    React.useEffect(() => {
        request("", [], null, null, null, true, null, null, null, 1, 10);
    }, [])

    const handleSearch = () => {
        request(world, [], null, banned, deleted, normal, creator, orderBy, order, page, 10);
    }


    return (
        <div style={{ 'marginTop': '100px' }}>

            <TextField id="world_name" label="World Name" type="search" variant="outlined" onChange={handleWorld} />
            <Input type="number" placeholder="Creator Id" onChange={handleCreator} />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={normal}
                        onChange={handleNormal}
                        name="normal"
                        color="primary"
                    />
                }
                label="Show Normal"
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

            <FormControlLabel
                control={
                    <Checkbox
                        checked={deleted}
                        onChange={handleDeleted}
                        name="deleted"
                        color="primary"
                    />
                }
                label="Show Deleted"
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

            <Button id="search" onClick={handleSearch} >Search</Button>


            {worlds && worlds.length !== 0 ?
                worlds.map((m, i) => {
                    return (<MapCard key={i} map={m} />)
                })
                :
                <Typography style={{ marginLeft: "auto", marginRight: "auto" }}>No worlds with these specifications.</Typography>
            }


            {worlds === null || worlds.length === 0 ?
                <></>
                :
                <Row style={{ marginBottom: "30px" }}>
                    <Pagination onChange={(event, page1) => { setPage(page1); handleSearch() }} style={{ marginLeft: "auto", marginRight: "auto" }} count={10} />
                </Row>
            }
        </div>
    )
}