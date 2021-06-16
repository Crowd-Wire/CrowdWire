import React, { Component } from "react";

import HomeWorkTwoToneIcon from '@material-ui/icons/HomeWorkTwoTone';

import TabHeader from './TabHeader';
import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import { API_BASE } from "config";


interface WallsTabState {
  tilesetWalls: React.ReactNode[];
}

const wallStyle = {
  transform: "scale(1.5)",
  margin: 30,
  boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
}

class WallsTab extends Component<{}, WallsTabState> {
  subscriptions: any[];
  state = {
    tilesetWalls: [],
    activeId: null,
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
        const tilesetImage = mapManager.tilesetProps[tileset.name]?.image,
          { firstgid, tileWidth, tileHeight, rows, columns } = tileset;
        
        if (!tilesetImage) {
          // Not a tileset
          break;
        }

        const imageURL = API_BASE + "static/maps/" + tilesetImage;

        // Wall
        let style = {
          backgroundImage: `url(${imageURL})`,
          backgroundPosition: `0px 0px`,
          width: 32,
          height: 2*32
        };
        let id = firstgid + "-0"
        tilesetWalls.push(
          <div
            key={id}
            onClick={() => this.handleClick(id)}
            style={{
              ...style,
              ...wallStyle,
            }}
          ></div>
        );
        
        // Window
        style = {
          backgroundImage: `url(${imageURL})`,
          backgroundPosition: `-${1*32}px 0px`,
          width: 2*32,
          height: 2*32
        };
        let id2 = firstgid + "-1"
        tilesetWalls.push(
          <div
            key={id2}
            onClick={() => this.handleClick(id2)}
            style={{
              ...style,
              ...wallStyle,
            }}
          ></div>
        );

        // Door
        style = {
          backgroundImage: `url(${imageURL})`,
          backgroundPosition: `-${3*32}px 0px`,
          width: 3*32,
          height: 2*32
        };
        let id3 = firstgid + "-2"
        tilesetWalls.push(
          <div
            key={id3}
            onClick={() => this.handleClick(id3)}
            style={{
              ...style,
              ...wallStyle,
              margin: '30px 45px',
            }}
          ></div>
        );

        // Double Door
        let id4 = firstgid + "-3"
        tilesetWalls.push(
          <div 
            key={id4}
            onClick={() => this.handleClick(id4)}
            style={{
              ...wallStyle,
              margin: '30px 50px',
              display: 'flex',
            }}
          >
            <div
              style={{
                backgroundImage: `url(${imageURL})`,
                backgroundPosition: `-${3*32}px 0px`,
                width: 2*32,
                height: 2*32,
              }}
            ></div>
            <div
              style={{
                backgroundImage: `url(${imageURL})`,
                backgroundPosition: `-${4*32}px 0px`,
                width: 2*32,
                height: 2*32,
              }}
            ></div>
          </div>
        );
      }
    }
    this.setState({ tilesetWalls });
  }

  handleClick = (id: string) => {
    useWorldEditorStore.setState(state => {
      const layers = state.layers;
      useWorldEditorStore.setState({ activeLayer: 'Wall Layer' });
      for (const name of Object.keys(layers))
        layers[name].active = ['__Collision', '__Float'].includes(name);
      console.log(layers);
      return { layers };
    });
    useWorldEditorStore.getState().setActive('wall', id);
  }

  render() {
    const { tilesetWalls } = this.state;
    return (
      <>
        <TabHeader names={['__Float', '__Collision']} Icon={HomeWorkTwoToneIcon} />

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
