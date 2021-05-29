import React from "react";

import MapManager from "phaser/MapManager.ts";

class TilesTab extends React.Component {

    tiles = [
        {color: 'green', type: 'GROUND'},
        {color: 'red', type: 'WALL'},
        {color: 'blue', type: 'WALL'},
        {color: 'yellow', type: 'OBJECT'},
        {color: 'orange', type: 'OBJECT'},
        {color: 'pink', type: 'OBJECT'},
    ];

    state = {
        filterType: ''
    }

    constructor(props) {
        super(props);
        this.mapManager = new MapManager();
    }

    componentDidMount() {
        fetch("http://localhost:8000/static/maps/tilesets/jardim.png")
            .then((res) => res.blob())
            .then(images => {
            // Then create a local URL for that image and print it
            this.outside = URL.createObjectURL(images)
        })
    }

    changeFilter = (filterType) => {
        this.setState({ filterType });
    }

    render() {
        const { filterType } = this.state;
        return (
            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "512px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "480px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "448px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "416px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "384px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "352px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "320px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "288px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "256px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "224px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "192px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "160px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "128px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "96px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "64px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "32px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
            </div>
        )
    }
}

export default TilesTab;
