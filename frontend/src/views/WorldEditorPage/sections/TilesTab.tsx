import React, { Component } from "react";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import MapManager from "phaser/MapManager";
import useWorldEditorStore, { ToolType } from "stores/useWorldEditorStore";

import { API_BASE } from "config";


interface TilesTabState {
  filterType: string;
  tilesetTiles: Record<string, React.ReactNode[]>;
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
      if (!tileset.name.startsWith('_') && !mapManager.tilesetProps[tileset.name]?.properties?.isWall) {
        // Not private and not a wall tileset
        const tiles = [],
          tilesetImage = mapManager.tilesetProps[tileset.name]?.image,
          { firstgid, tileWidth, tileHeight, rows, columns } = tileset;
        
        if (!tilesetImage) {
          // Not a tileset
          break;
        }

        for (let i = 0; i < rows; i++)
          for (let j = 0; j < columns; j++) {
            const id = (firstgid + i * columns + j).toString();
            const imageURL = API_BASE + "static/maps/" + tilesetImage;
            const style = {
              backgroundImage: `url(${imageURL})`,
              backgroundPosition: `${-tileHeight * j}px ${-tileWidth * i}px`,
            };
            useWorldEditorStore.getState().addTile(id, { style });
            tiles.push(
              <div
                key={id}
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
    useWorldEditorStore.getState().setTool({ type: ToolType.DRAW });
    useWorldEditorStore.getState().setActive('tile', id);
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
