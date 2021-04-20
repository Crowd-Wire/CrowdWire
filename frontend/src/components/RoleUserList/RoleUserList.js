import React, { useCallback } from "react";
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import MenuIcon from '@material-ui/icons/Menu';
import Col from 'react-bootstrap/Col';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import UserRow from 'components/UserRow/UserRow.js';
import update from 'immutability-helper';

export default function RoleUserList(props){

    const {roleName, value, setUsers, ...other} = props;
    const moveCard = useCallback((dragArray, hoverArray) => {
        const dragCard = value.users[dragArray[1]]; // outra vez?ah
        console.log(dragCard, dragArray, hoverArray);
        setUsers(dragArray, hoverArray, dragCard);
    });
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
            <div id="droppable">
                {value.users.map((user, index) => {
                    return <UserRow key={index} user={user["Nome"]} index={[roleName, index]} id={user["id"]} moveCard={moveCard}></UserRow>
                })
                }
            </div>
        </div>
    );
}
