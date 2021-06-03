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
  subscriptions: any[] = [];

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (useWorldEditorStore.getState().ready)
      this.handleReady();
    else
      this.subscriptions.push(useWorldEditorStore.subscribe(
        this.handleReady, state => state.ready));
  }

  componentWillUnmount() {
    this.subscriptions.forEach((unsub) => unsub());
  }

  handleReady = () => {
    this.mapManager = new MapManager();
    this.forceUpdate()
  }

  handleSelectChange = (event: React.ChangeEvent<{ value: string }>) => {
    this.setState({ filterType: event.target.value });
  }

  handleClick = (tileId: string) => {
    useWorldEditorStore.getState().setPaintTool({ tileId });
  }

  render() {
    const { filterType } = this.state;

    return (
      <>
        <FormControl style={{ marginLeft: 15, marginTop: 15 }}>
          <InputLabel htmlFor="select-tileset">Tileset:</InputLabel>
          <Select
            native
            value={filterType}
            onChange={this.handleSelectChange}
            inputProps={{
              id: 'select-tileset',
            }}
            style={{minWidth: '15ch'}}
          >
            <option aria-label="None" value="" />
            {
              this.mapManager && this.mapManager.map.tilesets.map((tileset, index) => (
                tileset.total != 0 && <option key={index} value={tileset.name}>{tileset.name}</option>
              ))
            }
          </Select>
        </FormControl>
        <hr />
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {
            this.mapManager && this.mapManager.map.tilesets.map((tileset) => {
              if (tileset.total != 0 && !tileset.name.startsWith('_')) {
                // Not an object and not private
                const tiles = [];

                const tilesetURL = this.mapManager.tilesetURL[tileset.name];
                const { firstgid, tileWidth, tileHeight, rows, columns } = tileset;

                for (let i = 0; i < rows; i++)
                  for (let j = 0; j < columns; j++) {
                    const id = firstgid + i * columns + j;
                    const imageURL = API_BASE + "static/maps/" + tilesetURL;
                    tiles.push(
                      <div
                        key={id}
                        id={`tile-${id}`}
                        onClick={() => this.handleClick(id.toString())}
                        style={{
                          display: tileset.name.startsWith(filterType) ? '' : 'none',
                          width: tileWidth,
                          height: tileHeight,
                          backgroundImage: `url(${imageURL})`,
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