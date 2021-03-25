import React, { Component } from "react";

import { Typography } from "@material-ui/core";
import CancelIcon from '@material-ui/icons/Cancel';
import PeopleOutlinedIcon from '@material-ui/icons/PeopleOutlined';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DashboardStats from 'views/Dashboard/sections/DashboardStats.js'
import 'bootstrap/dist/css/bootstrap.min.css';

class DashboardContent extends Component{
    cardTextStyles = {
        marginLeft:"5%",
        color:"white",
        display:"flex",
        verticalAlign: "center"
    };
    render(){
        return(
            <div style={{ padding: '10px', marginLeft:"5%"}}>    
                    <Row style={{ width:"100%", height:"50%", marginTop:"5%"}}>
                        <Col xs={10} sm={10} md={10} style={{backgroundSize:"cover", borderRadius:"15px", backgroundRepeat:"no-repeat",backgroundImage: 'url("https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg")'}}>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, borderBottomLeftRadius:"15px", borderBottomRightRadius:"15px", height:"50%", width:"100%", backgroundColor: "rgba(11, 19, 43, 0.85)"}}>
                                <Typography variant="h3" style={this.cardTextStyles} >
                                    Jungle
                                </Typography>
                                <Typography variant="caption" style={this.cardTextStyles}>
                                    Creation Date 08/03/2021
                                </Typography>
                                <Typography variant="body1" className="align-middle" style={{color:"white", marginLeft:"5%", width:"80%", marginTop:"3%", fontWeight:"bold"}}>
                                    <PeopleOutlinedIcon style={{backgroundColor:"white", borderRadius:"50%", padding:"2px", height:"30px",width:"30px", color:"black"}}/> 10 online
                                </Typography>
                            </div>
                        </Col>
                        <Col xs={1} sm={1} md={1}></Col>
                        <Col xs={1} sm={1} md={1}><CancelIcon style={{fontSize:"2rem"}}/></Col>
                    </Row>

                    <Row style={{minHeight:"39%", marginTop:"1%", width:"100%"}}>
                        <DashboardStats/>
                    </Row>
            </div>
        );
    }
}
export default DashboardContent;
