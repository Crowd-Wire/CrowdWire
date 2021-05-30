import React, { Component } from "react";

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";


interface TilesTabState {
  tilesets: any[],
  filterType: string
}


const tileStyle = {
  transform: "scale(1.5)",
  margin: 15,
  border: "1px solid black",
}

class TilesTab extends Component<{}, TilesTabState> {

  tiles = [
    { color: 'green', type: 'GROUND' },
    { color: 'red', type: 'WALL' },
    { color: 'blue', type: 'WALL' },
    { color: 'yellow', type: 'OBJECT' },
    { color: 'orange', type: 'OBJECT' },
    { color: 'pink', type: 'OBJECT' },
  ];

  state = {
    tilesets: [],
    filterType: '',
  }
  outside: any;

  mapManager: MapManager;

  constructor(props) {
    super(props);
    this.mapManager = new MapManager();

    useWorldEditorStore.subscribe(() => this.forceUpdate(), state => state.ready);
  }


  changeFilter = (filterType) => {
    this.setState({ filterType });
  }

  render() {
    console.log('render')
    const { filterType } = this.state;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {
          this.mapManager.map && this.mapManager.map.tilesets.map((tileset) => {
            if (this.mapManager.tileKeys.includes(tileset.name)) {
              const tiles = [];
              for (let i = 0; i < tileset.rows; i++)
                for (let j = 0; j < tileset.columns; j++) {
                  console.log(tileset.image.source[0].image['src'])
                  // console.log(URL.createObjectURL(tileset.image.source[0].image['src']));
                  tiles.push(
                    <img src={tileset.image.source[0].image['src']} style={{width: 32, height: 32}}>
                    {/* // <div
                    //   style={{
                    //     width: 32,
                    //     height: 32,
                    //     backgroundImage: tileset.image.source[0].image['src'],
                    //     backgroundPosition: "480px 512px",
                    //     ...tileStyle
                    //   }}
                    // ></div> */}
                    </img>
                  );
                }
                  
              return tiles;
            }
          })
        }
        {/* <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "512px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div>
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
                <div style={{width: 32, height: 32, backgroundImage: `url(${this.outside})`, backgroundPosition: "32px 512px", transform: "scale(1.5)", margin: 15, border: "1px solid black"}}></div> */}
      </div>
    )
  }
}

export default TilesTab;
