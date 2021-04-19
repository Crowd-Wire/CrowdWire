import React, { Component } from "react";
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import MenuIcon from '@material-ui/icons/Menu';
import Col from 'react-bootstrap/Col';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


export default function RoleUserList(props){

    const {roleName, value, ...other} = props;
    const users=[];
    console.log("key", roleName);

    for(let i = 0; i<value.users.length;i++){
        users.push(
            <Row style={{height:"35px"}}>
                <Col sm={10} md={10} style={{marginTop:"auto", marginBottom:"auto"}}>
                    <Typography style={{marginLeft:"30px"}}>
                        {value.users[i]}
                    </Typography>
                </Col>
                <Col sm={2} md={2} style={{marginTop:"auto", marginBottom:"auto"}}>
                    <MenuIcon/>
                </Col>
            </Row>
        );
    }
    return(
        <div style={{marginTop:"10px", marginBottom:"10px"}}>
            <Row style={{backgroundColor:"#5AB9BA"}}>
                <Col sm={10} md={10}>
                    <Typography variant="h5">{roleName}</Typography>
                </Col>
                <Col sm={2} md={2} style={{display:"flex",alignItems:"center"}}>
                        <ExpandMoreIcon/>
                </Col>
            </Row>
            {users}
        </div>
    );
}
