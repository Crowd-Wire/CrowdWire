import React, { Component } from "react";

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import { API_BASE } from "config";


interface WallsTabState {
  tilesetWalls: React.ReactNode[];
}


class WallsTab extends Component<{}, WallsTabState> {
  subscriptions: any[];
  state = {
    tilesetWalls: [],
  }

  constructor(props) {
    super(props);
    this.subscriptions = [];
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

    const tilesetWalls = [];
    for (const tileset of mapManager.map.tilesets) {
      if (mapManager.tilesetProps[tileset.name]?.properties?.isWall) {
        // A wall tileset
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
                  // ...tileStyle,
                }}
              ></div>
            );
          }
          tilesetWalls.push(tiles);
      }
    }
    this.setState({ tilesetWalls });
  }

  handleClick = (id: string) => {

  }

  render() {
    const { tilesetWalls } = this.state;
    return (
      <>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {
            tilesetWalls
        }
        </div>
      </>
    );
  }
}

export default WallsTab;
