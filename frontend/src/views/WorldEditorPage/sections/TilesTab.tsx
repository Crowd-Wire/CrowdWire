import React, { Component } from "react";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import { API_BASE } from "config";


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

  state = {
    tilesets: [],
    filterType: '',
  }

  mapManager: MapManager;

  constructor(props) {
    super(props);
    this.mapManager = new MapManager();

    useWorldEditorStore.subscribe(() => this.forceUpdate(), state => state.ready);
  }

  handleSelectChange = (event: React.ChangeEvent<{ value: string }>) => {
    this.setState({ filterType: event.target.value });
  }

  render() {
    console.log('render')
    const { filterType } = this.state;
    return (

      <>
        <FormControl style={{marginLeft: 15, marginTop: 15}}>
          <InputLabel htmlFor="select-tileset">Tileset:</InputLabel>
          <Select
            native
            value={filterType}
            onChange={this.handleSelectChange}
            inputProps={{
              id: 'select-tileset',
            }}
          >
            <option aria-label="None" value="" />
            {
              this.mapManager.map && this.mapManager.map.tilesets.map((tileset) => (
                tileset.total != 0 && <option value={tileset.name}>{tileset.name}</option>
              ))
            }
          </Select>
        </FormControl>
        <hr />
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {
            this.mapManager.map && this.mapManager.map.tilesets.map((tileset) => {
              if (tileset.total != 0 && tileset.name.startsWith(filterType)) {
                const tiles = [];
                // not an object

                const tilesetURL = this.mapManager.tilesetURL[tileset.name];
                const { name, firstgid, tileWidth, tileHeight, rows, columns } = tileset;
                console.log(tileset.name)

                for (let i = 0; i < rows; i++)
                  for (let j = 0; j < columns; j++) {
                    tiles.push(
                      <div
                        data-gid={firstgid + i * rows + j}
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
