import React from "react";
import Button from "components/CustomButtons/Button.js";
import Typography from "@material-ui/core/Typography";
import Row from 'react-bootstrap/Row';
import image from "assets/img/desert_404.jpg";
export default class NotFound extends React.Component {
    render () {
        return(
            <>
                <div style={{ backgroundImage: "url(" + image + ")", height:"100%", backgroundSize:"cover"}}>
                    <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                        <Typography variant="h2" style={{marginLeft:"auto", marginRight:"auto", marginTop:"20%"}}><em>There's nothing here...</em></Typography>
                    </Row>
                    <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                        <Button style={{marginLeft:"auto", marginRight:"auto", marginTop:"10%"}}>Back to dashboard</Button>
                    </Row>
                </div>
            </>
        );
    }
}