import React from "react";
import UserProfile from "./sections/UserProfile"
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import styles from "assets/jss/material-kit-react/views/loginPage.js";
import image from "assets/img/bg8.png";
import GridContainer from "components/Grid/GridContainer.js";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
    >
        {value === index && (
        <Box p={3}>
            <Typography>{children}</Typography>
        </Box>
        )}
    </div>
    );
    }
TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        display: 'flex',
        height: 224,
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    ...styles
}));

export default function UserSettings () {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    
    return(
    <>
    <div
        className={classes.pageHeader}
        style={{
        backgroundImage: "url(" + image + ")",
        backgroundSize: "cover",
        backgroundPosition: "top center"
        }}
    >
    <GridContainer justify="center">
        <div className={classes.root}>
        <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            className={classes.tabs}
        >
            <Tab label="Item One" {...a11yProps(0)} />
            <Tab label="Item Two" {...a11yProps(1)} />
            </Tabs>
            <TabPanel value={value} index={0}>
            <UserProfile/>
            </TabPanel>
            <TabPanel value={value} index={1}>
            <UserProfile/>
            </TabPanel>
        </div>
    </GridContainer>
    </div>
    
    </>
    )
    
}