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

    const ref = useRef(null);
    const [{ handlerId }, drop] = useDrop({
        accept: "CARD",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            // Time to actually perform the action
            console.log("dragIndex "+dragIndex+" :: hoverIndex "+hoverIndex);
            moveCard(dragIndex, hoverIndex);
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: "CARD",
        item: () => {
            return { id, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));
    return(
        <div id="draggable" ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
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
