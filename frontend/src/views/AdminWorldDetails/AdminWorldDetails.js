import React, { Component } from 'react';
import WorldService from 'services/WorldService.js';

export default class AdminWorldDetails extends Component {

    constructor(props){
        super(props);
        this.state = {world: null, reports: []}

    }

    componentDidMount(){
        // returns the world_id based on the url
        let world_id = window.location.pathname.split('/').pop();
        console.log(world_id);

        // retrieves the world details
        WorldService.getWorldDetails(world_id)
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            // TODO: handle errors
            this.setState({world: res});
            console.log(res);
        }).then(() =>{
            // retrieves the most recent reports
            WorldService.getAllReports(
                world_id, null, null, this.state.world.status == 0 ? false : true,
                'timestamp', 'desc', 1, 5)
            .then((res) => {return res.json()})
            .then((res) => { 
                this.setState({reports: res})
            })
        })
        


    }



    render() {
        return (
            <div>
                {this.state.reports.length !== 0 ? this.state.reports.map((r,i ) => {
                    
                    return(<div key={r.reporter}>
                        reporter: {r.reporter}
                    </div>)

                }): <h2>No reports found...</h2>}
            </div>
        )
    }
}

