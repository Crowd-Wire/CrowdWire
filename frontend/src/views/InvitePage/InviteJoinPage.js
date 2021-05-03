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


export default function InviteJoinPage(props){
    const navigate = useNavigate();

    let qs = new URLSearchParams(useLocation().search);

    useEffect(() => {


        if(AuthenticationService.getToken()){
            // TODO: handle error 
            let invite = qs.get("invite");
            if(invite){
                WorldService.InviteJoin(invite)
                .then((res) => {return res.json()})
                .then((res) => navigate("/world/"+res.world_id));
            }
            console.log(invite);    
        
        }else{
            navigate("/login");
        }
    }, []);

    return (
        <div className="container">
            <h1>Invalid World Invite Link!</h1>     
        </div>


    )
}