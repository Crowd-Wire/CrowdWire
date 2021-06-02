import React from "react";
import UserProfile from "./sections/UserProfile";
import UpdatePassword from "./sections/UpdatePassword";
import PropTypes from 'prop-types';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import styles from "assets/jss/material-kit-react/views/loginPage.js";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import AppBar from '@material-ui/core/AppBar';
import { createBrowserHistory } from 'history';



const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: 450,
        maxWidth: 500,
    },
    ...styles
}));

export default function UserSettings () {
    const classes = useStyles();
    const [value, setValue] = React.useState("1");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const goBack = () => {
        const history = createBrowserHistory();
        history.back();
    } 


    return(
        <div style={{ padding: '10px', marginLeft:"5%", marginRight:"2%", width:"100%"}}>    
            <Row style={{height:"80px", marginLeft:"auto", marginRight:"auto"}}>
                <Col>
                    <Row style={{ height:"100%", marginLeft:"auto", marginRight:"auto"}}>
                        <IconButton style={{border:"white solid 1px",borderRadius:"10px",height:"50px", width:"50px"}} onClick={goBack}>
                            <ArrowBackIcon style={{height:"40px", width:"40px", marginTop:"auto", color:"white", marginBottom:"auto"}}/>
                        </IconButton>
                    </Row>
                </Col>
            </Row>
            <Row style={{width:"100%"}}>
                <div style={{margin: 'auto'}}>
                    <div className={classes.root}>
                        <TabContext value={value} >
                            <AppBar position="static" >
                            <TabList
                                style={{backgroundColor: 'white'}}
                                onChange={handleChange}
                                variant="fullWidth"
                                centered
                                indicatorColor="primary"
                                textColor="primary"
                                aria-label="simple tabs example"
                            >
                                <Tab label="Edit Account" value="1"/>
                                <Tab label="Change Password" value="2"/>
                            </TabList>
                            </AppBar>
                            <TabPanel value="1" style={{width: "100%", maxWidth: 500}}>
                                <UserProfile/>
                            </TabPanel>
                            <TabPanel value="2" style={{width: "100%", maxWidth: 500}}>
                                <UpdatePassword/>
                            </TabPanel>
                        </TabContext>
                    </div>
                </div>
            </Row>
        </div>
    )
}