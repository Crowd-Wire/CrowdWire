import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import TextField from '@material-ui/core/TextField';
import 'bootstrap/dist/css/bootstrap.min.css';

const useStyles = makeStyles((theme) => ({
    actionButtons:{
        marginRight:theme.spacing(1),
    },
    descText:{
        marginLeft:"5%",
        color:"white",
    },
    titleText:{
        marginLeft:"5%"
    }
}));

export default function DashboardContent(){
    const classes = useStyles();
    return(
    <>    
        <div style={{height:"fit-content",borderRadius:"15px", width:"100%",}}>
            <br/>
            <Row style={{width:"100%",height:"90%"}}>
                <Col xs={12} sm={10} md={8} style={{marginBottom:"1%"}}>
                    <Row>

                            <Button variant="success" className={classes.actionButtons} style={{marginLeft:"5%",color:"black"}}>Enter Map</Button>
                            <Button variant="primary" className={classes.actionButtons}>Edit Map</Button>
                            <Button variant="primary " className={classes.actionButtons}>Manage Map</Button>

                    </Row>
                    <Row>
                        <Typography variant="h2" className={classes.titleText}>Jungle</Typography>
                        <Typography variant="body1" className={classes.descText}>This map was created with the purpose of gathering people to explore the ruins of the lost temple and convey a near life-like experience to users.</Typography>
                    </Row>
                </Col>
                <Col xs={12} sm={10} md={2} style={{borderRadius:"15px"}}>
                    <Row>
                        <Button variant="danger" style={{marginLeft:"auto"}}>Delete World</Button>

                    </Row>
                </Col>
            </Row>
        </div>
    </>
    );
}