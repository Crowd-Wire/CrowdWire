import React from 'react';
import WorldService from '../../../services/WorldService.ts';
import TagService from '../../../services/TagService.js';
import { Checkbox } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { Row, Col, Button } from 'react-bootstrap';
import Input from '@material-ui/core/Input';
import MapCard from 'components/MapCard/MapCard.js';
import Typography from '@material-ui/core/Typography';
import Pagination from '@material-ui/lab/Pagination';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Paginator from 'components/Paginator/Paginator.js';

const useStyles = makeStyles((theme) => ({
    formControl: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        minWidth: 120,
    },
    checkboxes:{
        marginTop: theme.spacing(2),
        minWidth: 120,
        color:'black'
    },
}));

export default function WorldsList() {
    const classes = useStyles();

    const [world, setWorld] = React.useState("");
    const [creator, setCreator] = React.useState(null);
    const [normal, setNormal] = React.useState(true);
    const [banned, setBanned] = React.useState(false);
    const [orderBy, setOrderBy] = React.useState("");
    const [order, setOrder] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [selectedTags, setSelectedTags] = React.useState([]);

    const [worlds, setWorlds] = React.useState([]);
    const [tags, setTags] = React.useState([]);

    const limit = 9;

    const handleWorld = (event) => {
        setWorld(event.target.value);
    }

    const handleCreator = (event) => {
        let value = event.target.value;
        if (value === '')
            value = null;
        setCreator(value);
    }

    // check if this the best solution
    const handleNormal = () => {
        setNormal(!normal);
    }

    const handleBanned = () => {
        setBanned(!banned);
    }

    const handleOrderBy = (event) => {
        setOrderBy(event.target.value);
    }

    const handleOrder = (event) => {
        setOrder(event.target.value);
    }

    const changePage = (page1) => {
        setPage(page1);
    }

    const request = (search, tags, banned, normal, creator, order_by, order, page, limit) => {
        WorldService.searchAdmin(search, tags, banned, normal, creator, order_by, order, page, limit)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if(! res.detail){
                    setWorlds(res);
                }
                
            })
    }

    React.useEffect(() => {
        handleSearch();
    }, [page]);

    React.useEffect(() => {
        request("", [], null, true, null, null, null, 1, limit);
        TagService.getAll()
            .then((res) => {
                if (res.status == 200)
                    return res.json()
            })
            .then((res) => {
                let arr = [];
                if (res)
                    res.forEach(tag => arr.push(tag.name));
                setTags(arr);
            })
    }, [])

    const handleSearch = (newRequest) => {
        if(newRequest){
            if(page !== 1)
                setPage(1)
            else
                request(world, selectedTags, banned, normal, creator, orderBy, order, 1, limit);  
        }

        request(world, selectedTags, banned, normal, creator, orderBy, order, page, limit);
    }


    return (
        <div style={{ paddingTop: '30px', paddingBottom:"20px"}}>
            <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                <Col sm={12} md={6} style={{marginLeft:"auto", marginRight:"auto"}}>
                    <TextField className={classes.formControl} id="world_name" placeholder="World Name" type="search" onChange={handleWorld} />
                    <Input className={classes.formControl} type="number" placeholder="Creator Id" onChange={handleCreator} />
                </Col>
                <Col sm={12} md={6} style={{marginLeft:"auto", marginRight:"auto"}}>
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
            </Row>
            <Row style={{marginLeft:"auto", marginRight:"auto", marginTop:"10px"}}>
                <Col sm={12} md={5} style={{marginLeft:"auto", marginRight:"auto"}}>
                    <FormControlLabel
                        className={classes.checkboxes}
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
                        className={classes.checkboxes}
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
                <Col sm={12} md={5} style={{marginLeft:"auto", marginRight:"auto"}}>
                    <Autocomplete
                        limitTags={5}
                        style={{ width: "80%", marginLeft: "auto", marginRight: "auto" }}
                        multiple
                        value={selectedTags}
                        onChange={(event, value) => setSelectedTags(value)}
                        id="tags-standard"
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
                <Col sm={12} md={2} style={{marginLeft:"auto", marginRight:"auto"}}>
                    <Button style={{marginLeft:"auto", marginRight:"auto"}} id="search" onClick={handleSearch}>Search</Button>
                </Col>
            </Row>
            <hr/>
            <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                {worlds && worlds.length !== 0 ?
                    worlds.map((m, i) => {
                        return (<MapCard key={i} baseUrl={""} map={m} banned={banned}/>)
                    })
                    :
                    <Typography style={{ marginLeft: "auto", marginRight: "auto" }}>No worlds with these specifications.</Typography>
                }
            </Row>
            <hr />
            <Container>
                <Paginator hasNext={worlds.length === limit + 1} page={page} changePage={(page) => { changePage(page) }} />
            </Container>
            <Row style={{height:"15px"}}/>
        </div>
    )
}
