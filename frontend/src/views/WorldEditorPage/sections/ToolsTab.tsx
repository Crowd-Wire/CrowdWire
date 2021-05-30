import React, { Component } from "react";

import MapManager from "phaser/MapManager";
import useWorldEditorStore, { Tile } from "stores/useWorldEditorStore";

import { API_BASE } from "config";

import PhotoSizeSelectSmallIcon from '@material-ui/icons/PhotoSizeSelectSmall';


interface ToolsTabState {
  tile: Tile,
}

const tileStyle = {
  transform: "scale(2)",
  boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
  backgroundRepeat: "no-repeat",
}


class ToolsTab extends Component<{}, ToolsTabState> {
  unsubscribe: any;

  constructor(props) {
    super(props);

    this.state = {
      tile: null
    }

    this.unsubscribe = useWorldEditorStore.subscribe(
      this.handleTileChange, state => state.paintTool)
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleTileChange = (painTool) => {
    // this.setState({ tile: painTool.tile })
  }

  render() {
    const tile = this.state.tile;
    let elem, newElem;

    if (tile) {
      elem = document.getElementById(`tile-${tile.id}`); 
      console.log( elem)
      // newElem = elem.cloneNode(true); 
      // newElem.setAttribute('id', 'tools-tile');
    }

    return (


      <>
        {tile }
        {/* <div
          style={tile ? tileStyle : {
            ...tileStyle,
            width: tile.width,
            height: tile.height,
            backgroundImage: `url(${tile.imageURL})`,
            backgroundPosition: `${-tile.height * tile.id}px ${-tile.width * i}px`,
          }}
        ></div> */}
        <hr />
        <PhotoSizeSelectSmallIcon />
      </>
    );
  }
}

export default ToolsTab;
