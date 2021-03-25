import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import TextField from '@material-ui/core/TextField';

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
                <Col xs={12} sm={10} md={4} style={{borderRadius:"15px", minWidth:"320px", maxWidth:"380px"}}>
                    <Container style={{height:"245px", borderRadius:"15px", backgroundColor:"#1C2541"}}>
                        <Typography style={{color:"white", marginBottom: '15px', fontSize:"1.5rem"}}>Friends Online (1)</Typography>
                        <Container style={{height:"60%",overflowY:"scroll"}}>
                            <Row style={{marginBottom:"2%", borderRadius:"10% / 50%" ,alignContent:"center", background:"linear-gradient(to right, rgba(255,255,255,1),transparent", height:"33%",width:"95%"}}>
                                <Col xs={2} sm={2} md={2} lg={2} style={{alignSelf:"initial",height:"100%", alignContent:"initial"}}>
                                    <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80" style={{position:"absolute", top:"5%",left:"5%", alignSelf:"initial", width:"100%", height:"90%", borderRadius:"50%", objectFit:"cover"}}></img>
                                </Col>
                                <Col xs={1} sm={1} md={1} lg={1}></Col>
                                <Col xs={8} sm={8} md={8} lg={8}><Typography>Mateus Silva</Typography></Col>
                            </Row>
                            <Row style={{marginBottom:"2%", borderRadius:"10% / 50%" ,alignContent:"center", background:"linear-gradient(to right, rgba(255,255,255,1),transparent", height:"33%",width:"95%"}}>
                                <Col xs={2} sm={2} md={2} lg={2} style={{alignSelf:"initial",height:"100%", alignContent:"initial"}}>
                                    <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80" style={{position:"absolute", top:"5%",left:"5%", alignSelf:"initial", width:"100%", height:"90%", borderRadius:"50%", objectFit:"cover"}}></img>
                                </Col>
                                <Col xs={1} sm={1} md={1} lg={1}></Col>
                                <Col xs={8} sm={8} md={8} lg={8}><Typography>Mateus Silva</Typography></Col>
                            </Row>

                        </Container>
                        <Container style={{marginTop:"5px"}}>
                            <Row style={{position:"relative", alignContent:"center", padding:"2px", backgroundColor:"#5BC0BE", borderRadius:"10px",height:"2%"}}>
                                <TextField size="small" placeholder="Invite friend to world" style={{width:"100%", marginLeft:"2%", marginRight:"2%"}}/>
                            </Row>
                        </Container>

                    </Container>
                </Col>
            </Row>
        </div>
    </>
    );
}