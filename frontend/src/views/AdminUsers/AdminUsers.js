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
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { useNavigate } from "react-router-dom";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
const useStyles2 = makeStyles((theme) => ({
  root: {
    width: '90%',
    marginLeft:"auto",
    marginRight:"auto",
    backgroundColor: theme.palette.background.paper,
    borderRadius:"15px",
    webkitBoxShadow: "0px 10px 13px -7px #000000, 5px 5px 5px 5px rgba(148,148,148,0)", 
    boxShadow: "0px 10px 13px -7px #000000, 5px 5px 5px 5px rgba(148,148,148,0)",
  },
  item:{
    '&:hover': {
      backgroundColor: "#ddd",
      cursor:"pointer",
      borderRadius:"5px"
    },
  },
  circle:{
    marginLeft:"10px",
    marginRight:"10px",
    marginTop:"auto",
    marginBottom:"auto",
    height: "10px",
    width: "10px",
    borderRadius: "50%",
    display: "inline-block",
  },
  inline: {
    display: 'inline',
  },
}));

const UserStatus = ({ status }) => {
    const classes2 = useStyles2();
    if(status===0)
        return (
            <>
                <span className={classes2.circle} style={{ backgroundColor: "#11f511" }}></span>
                <Typography variant="caption">Active</Typography>
            </>
        );
    if(status===1)
        return (
            <>
                <span className={classes2.circle} style={{ backgroundColor: "#f51137" }}></span>
                <Typography variant="caption">Banned</Typography>
            </>
        );
    if(status===2)
        return (
            <>
                <span className={classes2.circle} style={{ backgroundColor: "#000" }}></span>
                <Typography variant="caption">Deleted</Typography>
            </>
        );
    if(status===3)
        return (
            <>
                <span className={classes2.circle} style={{ backgroundColor: "#aedff2" }}></span>
                <Typography variant="caption">Pending</Typography>
            </>
        );
  };

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 150,
        color:'black'
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export default function AdminUsers() {
    const classes = useStyles();
    const classes2 = useStyles2();
    const [email, setEmail] = React.useState("");
    const [banned, setBanned] = React.useState(false);
    const [normal, setNormal] = React.useState(true);
    const [orderBy, setOrderBy] = React.useState("");
    const [order, setOrder] = React.useState("");
    const [page, setPage] = React.useState(1);
  
    const [users, setUsers] = React.useState([]);
    const navigation = useNavigate();

    React.useEffect(() => {
        UserService.search("", true, false, null, null, 1, 10)
        .then((res) =>{
            return res.json();
        })
        .then((res) =>{
            // TODO: handle errors
            if(!res.detail) setUsers(res);
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
        UserService.search(email, normal, banned, orderBy, order, 1, 10)
        .then((res) =>{
            return res.json();
        })
        .then((res) =>{
            // TODO: handle errors
            if(!res.detail) setUsers(res);
        })
    }

    

    return (
        <div style={{paddingTop: '30px', width:"100%"}}>
            <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                <Col md={3}>
                    <TextField className={classes.formControl} id="user_email" placeholder="User email" type="search" onChange={handleEmail} />
                </Col>
                <Col md={3}>
                    <FormControlLabel
                        className={classes.formControl}
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
                <Col md={4}>
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
                            <MenuItem value={"register_date"}>Date</MenuItem>
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
                    <Row>
                        <Button id="search" style={{marginRight:"auto", marginLeft:"auto"}} onClick={handleSearch}>Search</Button>
                    </Row>
                </Col>
            </Row>                
            <hr/>
            {users && users.length !== 0 ?
            <div>
                <List className={classes2.root}>
                {users.map((u, i) => {
                    return(
                        <>
                            <ListItem alignItems="flex-start" onClick={()=>navigation(""+u.user_id)} className={classes2.item}>
                                <ListItemAvatar>
                                <Avatar alt={u.name} src="/static/images/avatar/1.jpg" />
                                </ListItemAvatar>
                                <ListItemText
                                primary={
                                <React.Fragment>
                                    {u.name}
                                    <UserStatus status={u.status}/>
                                </React.Fragment>}
                                secondary={
                                    <React.Fragment>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        className={classes2.inline}
                                        color="textPrimary"
                                    >
                                        {u.email}
                                    </Typography>
                                    {"\t"+u.register_date}
                                    </React.Fragment>
                                }
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </> 
                    )
                })}
                </List>
            </div>
            : <h1>Loading</h1>}
        </div>

    )
}
