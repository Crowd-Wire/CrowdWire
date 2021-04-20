import React, { Component } from "react";
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import MenuIcon from '@material-ui/icons/Menu';
import Col from 'react-bootstrap/Col';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Draggable } from 'react-beautiful-dnd';

export default function UserRow(props){

    const {user, index, ...other} = props;
    return(
        <Draggable draggableId={user} index={index}>
                {(provided) => (
                    <Row 
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        style={{height:"35px", border:"solid #58B7B8 1px", borderRadius:"10px", marginTop:"3px"}}
                    >
                        <Col sm={10} md={10} style={{marginTop:"auto", marginBottom:"auto"}}>
                            <Typography style={{marginLeft:"30px"}}>
                                {user}
                            </Typography>
                        </Col>
                        <Col sm={2} md={2} style={{marginTop:"auto", marginBottom:"auto"}}>
                            <MenuIcon/>
                        </Col>
                    </Row>
                )}
            </Draggable>
    );
}
