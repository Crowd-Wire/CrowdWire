import React from 'react';
import {Row, Col} from 'react-bootstrap';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

export default function Paginator(props) {

    return (
        <Row>
            <Col sm="1" md="1" lg="1">
                {props.page !== 1 ? <ArrowBackIosIcon onClick={() => props.changePage(props.page - 1)} /> : <></> }
            </Col>
            <Col sm="10" md="10" lg="10" style={{textAlign:'center'}}> {props.page} </Col>
            <Col sm="1" md="1" lg="1">
                {props.hasNext ? <ArrowForwardIosIcon onClick={() => props.changePage(props.page + 1)} /> : <></>}
            </Col>
        </Row>
    )
}
