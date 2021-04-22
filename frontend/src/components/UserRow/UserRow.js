import React, {useRef} from "react";
import { useDrag, useDrop } from 'react-dnd';
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import MenuIcon from '@material-ui/icons/Menu';
import Col from 'react-bootstrap/Col';



export default function UserRow(props){

    const {user, index, id, moveCard, allRoles, style, setUsers, ...other} = props;



    const changeItemColumn = (currentItem, columnName) => {
        setUsers(currentItem, columnName);
    };
    const [{ isDragging }, drag] = useDrag({
        type: "ACCEPT",
        item: {
            id:id,
            Nome: user
        },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (!dropResult)
                return;
            console.log(allRoles);
            allRoles.forEach(rName => {
                console.log(rName);
                console.log("dropRes"+dropResult.name);
                if (dropResult && dropResult.name === rName){
                    console.log("role name is "+rName);
                    changeItemColumn(item, rName);
                }
            });
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0.4 : 1;

    // drag(drop(ref));
    return(
        <div id="draggable" ref={drag} style={{ ...style, opacity }} > {/*data-handler-id={handlerId}>*/}
            <Row 
                style={{height:"35px", border:"solid #58B7B8 1px", borderRadius:"10px", marginTop:"3px"}}
            >
                <Col xs={10} sm={10} md={10} style={{marginTop:"auto", marginBottom:"auto"}}>
                    <Typography style={{marginLeft:"30px"}}>
                        {user}
                    </Typography>
                </Col>
                <Col xs={2} sm={2} md={2} style={{marginTop:"auto", marginBottom:"auto"}}>
                    <MenuIcon/>
                </Col>
            </Row>
        </div>
    );
}
