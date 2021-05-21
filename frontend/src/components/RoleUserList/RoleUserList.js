import React, { useCallback } from "react";
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import MenuIcon from '@material-ui/icons/Menu';
import Col from 'react-bootstrap/Col';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import UserRow from 'components/UserRow/UserRow.js';
import update from 'immutability-helper';
import { useDrop } from 'react-dnd';
import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';

const useStyles = makeStyles((theme) => ({
    margin: {
      margin: theme.spacing(1),
    },
  }));

export default function RoleUserList(props){

    const classes = useStyles();
    const {roleName, value, setUsers, allRoles, ...other} = props;

    

    const [, drop] = useDrop({
        accept: "ACCEPT",
        drop: () => ({name: roleName}),
    });

    const moveCard = useCallback((dragArray, hoverArray) => {
        const dragCard = value.users[dragArray[1]];
        setUsers(dragArray, hoverArray, dragCard);
    });
    return(
        <div style={{marginTop:"10px", marginBottom:"10px"}}>
            <Row style={{backgroundColor:"#58B6B8"}}>
                <Col sm={10} md={10}>
                    <InputBase
                        className={classes.margin}
                        defaultValue={roleName}
                        inputProps={{ 'aria-label': 'naked' }}
                    />
                </Col>
                <Col sm={2} md={2} style={{display:"flex",alignItems:"center"}}>
                        <ExpandMoreIcon/>
                </Col>
            </Row>
            <Row>
                <Col id="droppable" ref={drop} style={{width:"100%", minHeight:"20px", border:"1px solid #58B6B8", borderRadius:"10px"}}>
                    {value.map((user, index) => {
                        console.log(roleName);
                        console.log(user);
                        return <UserRow key={index} user={user.username} index={[roleName, index]} id={index} allRoles={allRoles} setUsers={setUsers} moveCard={moveCard}></UserRow>
                    })
                    }
                </Col>
            </Row>
        </div>
    );
}
