import React, { Component } from "react";
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import MenuIcon from '@material-ui/icons/Menu';
import Col from 'react-bootstrap/Col';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Droppable, Draggable } from 'react-beautiful-dnd';
import UserRow from 'components/UserRow/UserRow.js';
export default function RoleUserList(props){

    const {roleName, value, ...other} = props;
    return(
        <div style={{marginTop:"10px", marginBottom:"10px"}}>
                <Row style={{backgroundColor:"#5AB9BA"}}>
                    <Col sm={10} md={10}>
                        <Typography variant="h5">{roleName}</Typography>
                    </Col>
                    <Col sm={2} md={2} style={{display:"flex",alignItems:"center"}}>
                            <ExpandMoreIcon/>
                    </Col>
                </Row>
                <Droppable style={{overflow:"auto"}} droppableId={roleName}>
                    {provided => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {value.users.map((user, index) =><UserRow key={index} user={user} index={index}></UserRow>)}
                            {provided.placeholder}
                        </div>
                        )}
                </Droppable>
            </div>
    );
}
