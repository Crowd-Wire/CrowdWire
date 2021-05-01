import React from "react";

export default class TilesTab extends React.Component {

    constructor(props){
        super(props);
    }
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

    changeFilter = (filterType) => {
        this.setState({ filterType });
    }

    render() {
        const { filterType } = this.state;
        return (
            {this.props.open ? 
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {
                        this.tiles.filter((tile) => filterType ? tile.type === filterType : true)
                        .map((tile, index) => (
                            <div key={index} style={{background: tile.color, width: '50px', height: '50px', margin: '10px'}}></div>
                        ))
                    }
                </div>
                :
                <></>
            }
        )
    }
}