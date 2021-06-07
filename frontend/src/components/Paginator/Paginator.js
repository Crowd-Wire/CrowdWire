import React from 'react';
import {Row, Col} from 'react-bootstrap';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Button from "components/CustomButtons/Button.js";


export default function Paginator(props) {

    return (
        <Row style={{paddingBottom: 50}}>
            <Col sm="1" md="1" lg="1">
                {props.page !== 1 ? <ArrowBackIosIcon onClick={() => props.changePage(props.page - 1)} style={{cursor: 'pointer', color: 'rgb(0, 135, 255)'}} /> : <></> }
            </Col>
            <Col sm="10" md="10" lg="10" style={{textAlign:'center'}}>
                <Button color="primary" justIcon round style={{pointerEvents: 'none', background: 'rgb(0, 135, 255)'}}>
                    {props.page}
                </Button>
            </Col>
            <Col sm="1" md="1" lg="1">
                {props.hasNext ? <ArrowForwardIosIcon onClick={() => props.changePage(props.page + 1)} style={{cursor: 'pointer', color: 'rgb(0, 135, 255)'}} /> : <></>}
            </Col>
        </Row>
    )
}
