import React from 'react';
import AuthenticationService from 'services/AuthenticationService.js';
import { Card, Box } from '@material-ui/core';
import image from "assets/img/bg8.png";
import {useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import logo from 'assets/crowdwire_white_logo.png';
import ErrorIcon from '@material-ui/icons/Error';

const toast_props = {
    position: toast.POSITION.TOP_CENTER,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true,
    pauseOnFocusLoss: false,
    pauseOnHover: false,
    progress: undefined,
  }
  

export default function ConfirmEmail() {

    const [verified, setVerified] = React.useState(0)
    const navigate = useNavigate();

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
                if (res) {
                    AuthenticationService.setToken(res, "REGISTER");
                    toast.success(
                        <span>
                          <img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
                          Your account is now verified!
                        </span>
                        , toast_props
                      );
                    navigate("/dashboard/search/public");
                }
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
                        <Card style={{ width: '100%', height: '100%',  justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                            <ErrorIcon style={{color: 'red', fontSize: '10rem', flexGrow: '1', display: 'flex', justifyContent: 'center'}} />
                            <h3 style={{flexGrow: '3', display: 'flex', justifyContent: 'left'}}>Verification Link could not be validated.</h3>
                        </Card>
                    </Box>



                }</>
            }


        </div>
    )

}
