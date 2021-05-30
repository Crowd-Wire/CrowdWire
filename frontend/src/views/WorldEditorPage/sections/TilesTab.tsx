import React, { Component } from "react";

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import {API_BASE} from "config";


interface TilesTabState {
  tilesets: any[],
  filterType: string,
}


const tileStyle = {
  transform: "scale(1.5)",
  margin: 15,
  boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
  backgroundRepeat: "no-repeat",
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

      <>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {
            this.mapManager.map && this.mapManager.map.tilesets.map((tileset) => {
              if (tileset.total != 0) {
                const tiles = [];
                // not an object

                const tilesetURL = this.mapManager.tilesetURL[tileset.name];
                const {name, firstgid, tileWidth, tileHeight, rows, columns} = tileset;
                console.log(tileset.name)

                for (let i = 0; i < rows; i++)
                  for (let j = 0; j < columns; j++) {
                    tiles.push(
                      <div
                        data-gid={firstgid + i*rows + j}
                        style={{
                          width: tileHeight,
                          height: tileWidth,
                          backgroundImage: `url(${API_BASE + "static/maps/" + tilesetURL})`,
                          backgroundPosition: `${-tileHeight * j}px ${-tileWidth * i}px`,
                          ...tileStyle
                        }}
                      ></div>
                    );
                  }
                return tiles;
              }
            })
          }
        </div>
      </>
    )
  }
}

export default TilesTab;
