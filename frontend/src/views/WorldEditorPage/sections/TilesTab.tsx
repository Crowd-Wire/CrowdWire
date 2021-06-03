import React, { Component } from "react";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import { API_BASE } from "config";


interface TilesTabState {
  filterType: string,
  tilesetTiles: Record<string, React.ReactNode[]>,
}

const tileStyle = {
  transform: "scale(1.5)",
  margin: 15,
  boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
  backgroundRepeat: "no-repeat",
}


class TilesTab extends Component<{}, TilesTabState> {

  state = {
    filterType: '',
    tilesetTiles: {},
  }
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
    const mapManager = new MapManager();

    const tilesetTiles = {};
    for (const tileset of mapManager.map.tilesets) {
      if (tileset.total != 0 && !tileset.name.startsWith('_')) {
        // Not an object and not private
        const tiles = [],
          tilesetURL = mapManager.tilesetURL[tileset.name],
          { firstgid, tileWidth, tileHeight, rows, columns } = tileset;

        for (let i = 0; i < rows; i++)
          for (let j = 0; j < columns; j++) {
            const id = (firstgid + i * columns + j).toString();
            const imageURL = API_BASE + "static/maps/" + tilesetURL;
            const style = {
              backgroundImage: `url(${imageURL})`,
              backgroundPosition: `${-tileHeight * j}px ${-tileWidth * i}px`,
            };
            useWorldEditorStore.getState().addTile(id, { style });
            tiles.push(
              <div
                key={id}
                id={`tile-${id}`}
                onClick={() => this.handleClick(id)}
                style={{
                  width: tileWidth,
                  height: tileHeight,
                  ...style,
                  ...tileStyle,
                }}
              ></div>
            );
          }
        tilesetTiles[tileset.name] = tiles;
      }
    }
    this.setState({ tilesetTiles });
  }

  handleSelectChange = (event: React.ChangeEvent<{ value: string }>) => {
    this.setState({ filterType: event.target.value });
  }

  handleClick = (id: string) => {
    useWorldEditorStore.getState().setState({ activeTile: id });
  }

  render() {
    const { filterType, tilesetTiles } = this.state;

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
            style={{ minWidth: '15ch' }}
          >
            <option aria-label="None" value="" />
            {
              Object.keys(tilesetTiles).map((name, index) => (
                <option key={index} value={name}>{name}</option>
              ))
            }
          </Select>
        </FormControl>
        <hr />
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {console.log(filterType, tilesetTiles)}
        {
          filterType ? 
            tilesetTiles[filterType] : Object.values(tilesetTiles)
        }
        </div>
      </>
    )
  }
}

export default TilesTab;
