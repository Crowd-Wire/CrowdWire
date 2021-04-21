import React, {useRef} from "react";
import { useDrag, useDrop } from 'react-dnd';
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import MenuIcon from '@material-ui/icons/Menu';
import Col from 'react-bootstrap/Col';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import { Draggable } from 'react-beautiful-dnd';


export default function UserRow(props){

    const {user, index, id, moveCard, style, ...other} = props;

    const [{ isDragging }, drag] = useDrag({
        type: "ACCEPT",
        item: {
            name: "name"
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
                <Col sm={10} md={10} style={{marginTop:"auto", marginBottom:"auto"}}>
                    <Typography style={{marginLeft:"30px"}}>
                        {user}
                    </Typography>
                </Col>
                <Col sm={2} md={2} style={{marginTop:"auto", marginBottom:"auto"}}>
                    <MenuIcon/>
                </Col>
            </Row>
        </div>
    );
}
