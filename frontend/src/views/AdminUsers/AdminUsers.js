import React from 'react';
import UserService from 'services/UserService';
import { Checkbox } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from 'react-bootstrap';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export default function AdminUsers() {
    const classes = useStyles();

    const [email, setEmail] = React.useState("");
    const [banned, setBanned] = React.useState(false);
    const [normal, setNormal] = React.useState(true);
    const [orderBy, setOrderBy] = React.useState(null);
    const [order, setOrder] = React.useState(null);
    const [page, setPage] = React.useState(1);
  
    const [users, setUsers] = React.useState([]);

    React.useEffect(() => {
        UserService.search("", true, false, null, null, 1, 10)
        .then((res) =>{
            return res.json();
        })
        .then((res) =>{
            // TODO: handle errors
            console.log(res);
            setUsers(res);
        })

    }, [])

    const handleEmail = (event) => {
        setEmail(event.target.value);
    }

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

    const handleSearch = () =>{
        // make the request
        console.log("search")
    }

    

    return (
        <div style={{marginTop: '100px'}}>
            <TextField id="user_email" label="User email" type="search" variant="outlined" onChange={handleEmail} />
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

            {users && users.length !== 0 ?
            <div>
                {users.map((u, i) => {
                    // TODO: create card?? table?? 
                    return(
                        <h1>{u.email}</h1>
                    )
                })}
            </div>
            : <h1>Loading</h1>}
        </div>

    )
}
