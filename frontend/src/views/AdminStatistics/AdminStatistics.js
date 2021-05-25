import React, { Component } from "react";
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import useAuthStore from "stores/useAuthStore";
import Row from 'react-bootstrap/Row';

import SearchAllMaps from "views/DashSearch/sections/SearchAllMaps";
import WorldService from "services/WorldService";
import EventService from "services/EventService";
import EventFilters from "./sections/EventFilters"
class AdminStatistics extends Component {
    constructor(props){
        super(props)
        this.state = {
            event_type: "",
            worlds: [],
            world_id: 1,
            user_id: null,
            page:1,
            start_date:null,
            end_date:null,
            order_desc: true,
            events:null
        }
    }

    handleCallBack = (event_type,world,startDate,endDate,ordering) => {
        let order = ordering == "descending"
        console.log(event_type)
        EventService.getEvents(
            event_type,world,
            undefined,
            startDate.toISOString(),
            endDate.toISOString(),
            order,
            10,
            1)
            .then( (res) => {
                if(res.status == 200) 
                    return res.json()
            })
            .then( (res) => {
                this.setState({events: res})
                console.log(this.state.events)
            })

    }

    componentDidMount(){
        WorldService.search("",[],"public", 1)
        .then((res) => {
            if(res.status == 200) 
                return res.json()
        })
        .then((res) => {
            if(res)
                this.setState({ worlds: res }) 
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
            </div>
            </>
        )
    }
}

export default AdminStatistics;