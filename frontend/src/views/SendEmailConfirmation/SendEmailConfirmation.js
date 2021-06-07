import React from 'react'
import { Card, Box } from '@material-ui/core';
import image from "assets/img/bg8.png";


export default function SendEmailConfirmation() {

    return (
        <div style={{display: 'flex',  justifyContent:'center',
             alignItems:'center', height: '100vh', backgroundImage: 'url(' + image + ')', backgroundSize: "cover",
             backgroundPosition: "top center"}} >
            <Box width="70%" height="50%">
                <Card style={{width:'100%', height: '100%', justifyContent:'center', alignItems:'center',display: 'flex' }}>
                    <h3>A Verification Email was sent.</h3>
                </Card>
            </Box>


        </div>
    )
}
