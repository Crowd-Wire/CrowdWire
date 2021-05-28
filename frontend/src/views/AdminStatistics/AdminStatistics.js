import React, { Component } from "react";
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import useAuthStore from "stores/useAuthStore";
import Row from 'react-bootstrap/Row';

import SearchAllMaps from "views/DashSearch/sections/SearchAllMaps";
import WorldService from "services/WorldService";
import EventService from "services/EventService";
import EventFilters from "./sections/EventFilters";
import EventResults from "./sections/EventResults";
class AdminStatistics extends Component {
    constructor(props){
        super(props)
        this.state = {
            worlds: [],
            events:null
        }
    }

    handleCallBack = (event_type,world,startDate,endDate,ordering) => {
        let order = ordering == "Descending";
        let parsestartDate = startDate == null ? null : startDate.toISOString();
        let parseendDate = endDate == null ? null : endDate.toISOString();

        EventService.getEvents(
            event_type,world,
            null,
            parsestartDate,
            parseendDate,
            order,
            10,
            1)
            .then( (res) => {
                if(res.status == 200) 
                    return res.json();
            })
            .then( (res) => {
                this.setState({events: res});
            })

    }

    componentDidMount(){
        WorldService.searchAdmin("", [], null, null, true, null, null, null, 1, 10)
        .then((res) => {
            if(res.status == 200) 
                return res.json();
        })
        .then((res) => {
            if(res)
                this.setState({ worlds: res });
        }).catch((error) => {useAuthStore.getState().leave()});
    }

    render() {
        return (
            <>
            <div style={{ marginTop: '100px' }}>
                {this.state.worlds!==null && this.state.worlds.length!==0 ? (
                <EventFilters  handler={this.handleCallBack}  worlds = {this.state.worlds} />
                )
                :
                <Typography style={{marginLeft:"auto", marginRight:"auto"}}>No worlds with these specifications.</Typography>
            }
            {this.state.worlds!==null && this.state.worlds.length!==0 ? (
                <EventResults events = {this.state.events} />
                )
                :
                <Typography style={{marginLeft:"auto", marginRight:"auto"}}>No Events</Typography>
                }
            </div>
            </>
        )
    }
}

export default AdminStatistics;