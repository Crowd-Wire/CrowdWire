import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Autocomplete from '@material-ui/lab/Autocomplete';

export default function EventFilters(props){
    event_types_helper = ["JOIN_PLAYER", "LEAVE_PLAYER", "JOIN_CONFERENCE", "LEAVE_CONFERENCE"]
    const [eventstypes, setEventtypes] = React.useState(event_types_helper)
    changeEventTypes = (value) => {
        setEventtypes(value)
    }
    return (
        <>
        <Row>                                
            {isOpened ?
                <Col xs={8} sm={8} md={8} lg={8} style={{alignContent:"center"}}>
                        <Container size="small" style={{marginLeft:"auto", marginRight:"auto"}}>
                            <Autocomplete
                                limitTags={5}
                                style={{width:"70%", marginLeft:"auto",marginRight:"auto"}}
            multiple
            value={eventstypes}
            onChange={(event, value) => changeEventTypes(value)}
                                id="tags-standard"
                                options={event_types_helper}
                                getOptionLabel={(option) => option}
                                renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="Event Types"
                                />
                                )}
                            />
                        </Container>
                </Col>
                :          
                <Col xs={6} sm={6} md={6}></Col>
        }
        </Row>
        </>
    )
}