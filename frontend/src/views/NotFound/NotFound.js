import React from "react";
import Button from "components/CustomButtons/Button.js";
import Typography from "@material-ui/core/Typography";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import image from "assets/img/desert_404.jpg";
export default class NotFound extends React.Component {
    render () {
        return(
            <>
                <div style={{ backgroundImage: "url(" + image + ")", height:"100%", backgroundSize:"cover"}}>
                    <Row style={{marginLeft:"auto", marginRight:"auto", height:"45%"}}>
                        <Col>
                        <Row style={{marginLeft:"auto", marginRight:"auto", marginTop:"10%" }}>
                            <Typography variant="h1" style={{marginLeft:"auto", marginRight:"auto" }}>404</Typography>
                        </Row>
                        <Row style={{marginLeft:"auto", marginRight:"auto" }}>
                            <Typography variant="h2" style={{marginLeft:"auto", marginRight:"auto" }}><em>There's nothing here...</em></Typography>
                        </Row>
                        </Col>
                    </Row>
                    <Row style={{marginLeft:"auto", marginRight:"auto", marginTop:"12%"}}>
                        <Link to={"/dashboard/search/public"} style={{marginLeft:"auto", marginRight:"auto"}}>
                            <Button style={{marginLeft:"auto", marginRight:"auto", marginTop:"12%"}}>Back to dashboard</Button>
                        </Link>
                    </Row>
                </div>
            </>
        );
    }
}