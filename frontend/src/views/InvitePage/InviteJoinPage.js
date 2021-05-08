import { useEffect } from "react";
import AuthenticationService from "../../services/AuthenticationService";
import WorldService from "../../services/WorldService";
import { useNavigate } from 'react-router-dom';
import React from 'react';
import {
    BrowserRouter as Router,
    Link,
    useLocation
  } from "react-router-dom";
import {Col, Row, Card} from 'react-bootstrap';
import Image from "assets/img/bg8.png";


export default function InviteJoinPage(props){
    const navigate = useNavigate();

    let qs = new URLSearchParams(useLocation().search);

    useEffect(() => {
        if(AuthenticationService.getToken()){
            let invite = qs.get("invite");
            if(invite){
                WorldService.inviteJoin(invite)
                .then((res) => {
                    if(res.status == 401)
                        navigate("/login");            
                    return res.json();
                })
                .then((res) => {
                    if(res && res.world_id)
                        navigate("/world/"+res.world_id);
                });
            }
        }else{
            navigate("/login");
        }
    }, []);

    return (
        <Row style={{height: "100%", backgroundImage: "url("+Image+")", backgroundSize: "cover"}} className="align-items-center">
            <Col xs={1} md={2}>
            </Col>
            <Col xs={4} md={8}>
                <Card style={{padding: "4rem 8rem"}}>
                    <h1 style={{margin:"auto"}}>Invalid Invite Link!</h1>
                </Card>
            </Col>
            <Col xs={1} md={2}></Col>
        </Row>

    )
}