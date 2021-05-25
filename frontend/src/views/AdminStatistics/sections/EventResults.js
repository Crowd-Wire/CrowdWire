import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import Container from '@material-ui/core/Container';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import getEventDescription from "../../../utils/EventDescription"
import parseDate from "../../../utils/parsetoLocalDate"
const useStyles = makeStyles({
   table: {
    minWidth: 650,
  },
});

export default function EventResults(props) {
    let events = props.events
    const classes = useStyles();
    return (
        <>
        <Row>
        <Container size="small" >
            <Col xs={12} sm={12} md={12}>
        <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">World</TableCell>
            <TableCell align="left">User</TableCell>
            <TableCell align="center">Event</TableCell>
            <TableCell align="left">Type</TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
            {events !== null ? 
            
            events.map((row) => (
            <TableRow key={row.id}>
            <TableCell align="left" component="th" scope="row">
                {row.world_id}

            </TableCell>
            <TableCell align="left">{row.user_id}</TableCell>
            <TableCell align="center">{getEventDescription(
                row.event_type,row.user_id, row.world_id, parseDate(row.timestamp))}
            </TableCell>
            <TableCell align="left">{row.event_type}</TableCell>
            </TableRow>
        ))
        : ""}
        </TableBody>
      </Table>
    </TableContainer>
    </Col>
    </Container>
    </Row>
        </>
    )
}