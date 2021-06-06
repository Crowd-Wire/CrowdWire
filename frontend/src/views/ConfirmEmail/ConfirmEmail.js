import React from 'react';
import AuthenticationService from 'services/AuthenticationService.js';
import { Card, Box } from '@material-ui/core';
import image from "assets/img/bg8.png";

export default function ConfirmEmail() {

    const [verified, setVerified] = React.useState(0)

    React.useEffect(() => {

        let url = window.location.pathname;
        let token = url.split('/')[url.split('/').length - 1]
        AuthenticationService.confirmEmail(token)
            .then((res) => {
                if (res.ok) {
                    setVerified(1);
                    return res.json();
                }
                else {
                    setVerified(2);
                }

            }).then((res) => {
                if (res)
                    AuthenticationService.setToken(res, "REGISTER");
            })

    }, [])

    return (
        <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', height: '100vh', backgroundImage: 'url(' + image + ')', backgroundSize: "cover",
            backgroundPosition: "top center"
        }} >
            {verified == 0 ?
                <h1>Loading</h1>
                : <>{verified == 1 ?

                    <><h1>Email Verified Successfully.</h1></>

                    :

                    <Box width="70%" height="50%">
                        <Card style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                            <h3>Verification Link not Valid.</h3>
                        </Card>
                    </Box>



                }</>
            }


        </div>
    )

}
