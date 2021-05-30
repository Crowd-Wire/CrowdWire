import React, { Component } from "react";

import useWorldEditorStore from "stores/useWorldEditorStore";

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import {
  FaEraser,
  FaEyeDropper,
  FaFill,
  FaPencilAlt,
  FaRegSquare,
  FaUndo,
  FaRedo
} from 'react-icons/fa';


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
    tileElem.style["transform"] = "scale(2.5)"
    const tileContainer = document.getElementById("tile-container");
    tileContainer.replaceChild(tileElem, tileContainer.childNodes[0]);
  }

  render() {

    return (
      <>
        <div id="tile-container" style={{ display: 'flex', justifyContent: 'center', margin: '25px 0' }}>
          <div></div>
        </div>

        <hr />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ButtonGroup variant="contained" color="default" aria-label="contained primary button group">
            <Button><FaPencilAlt style={{ fontSize: "1.5rem" }} /></Button>
            <Button><FaEraser style={{ fontSize: "1.5rem" }} /></Button>
            <Button><FaFill style={{ fontSize: "1.5rem" }} /></Button>
            <Button><FaRegSquare style={{ fontSize: "1.5rem" }} /></Button>
            <Button><FaEyeDropper style={{ fontSize: "1.5rem" }} /></Button>
          </ButtonGroup>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <ButtonGroup variant="contained" color="default" aria-label="contained primary button group">
            <Button><FaUndo style={{ fontSize: "1.5rem" }} /></Button>
            <Button><FaRedo style={{ fontSize: "1.5rem" }} /></Button>
          </ButtonGroup>
        </div>

      </>
    );
  }
}

export default ToolsTab;
