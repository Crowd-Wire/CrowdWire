import React, { Component } from "react";

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import { API_BASE } from "config";

import PhotoSizeSelectSmallIcon from '@material-ui/icons/PhotoSizeSelectSmall';


interface ToolsTabState {
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
    const tileElem: any = document.getElementById(`tile-${painTool.tileId}`).cloneNode(true);
    tileElem.removeAttribute('id');
    tileElem.style["transform"]  = "scale(2.5)"
    const tileContainer = document.getElementById("tile-container");
    tileContainer.replaceChild(tileElem, tileContainer.childNodes[0]);
  }

  render() {

    return (


      <>
        <div id="tile-container" style={{display: 'flex', justifyContent: 'center', margin: '25px 0'}}>
          <div></div>
        </div>
       
        <hr />
        <PhotoSizeSelectSmallIcon />
      </>
    );
  }
}

export default ToolsTab;
