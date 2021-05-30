import React, { Component } from "react";

import useWorldEditorStore, { PaintToolType } from "stores/useWorldEditorStore";

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
  toolType: string;
}


class ToolsTab extends Component<{}, ToolsTabState> {
  unsubscribe: any;

  constructor(props) {
    super(props);

    this.state = {
      toolType: null,
    }

    this.unsubscribe = useWorldEditorStore.subscribe(
      this.handleTileChange, state => state.paintTool)
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleTileChange = (paintTool) => {
    if (!paintTool.tileId)
      return;

    const tileElem: any = document.getElementById(`tile-${paintTool.tileId}`).cloneNode(true);
    tileElem.removeAttribute('id');
    tileElem.style["transform"] = "scale(2.5)"
    const tileContainer = document.getElementById("tile-container");
    tileContainer.replaceChild(tileElem, tileContainer.childNodes[0]);
  }

  handlePaintToolChange = (type: PaintToolType) => {
    const toolType = this.state.toolType === type ? PaintToolType.NONE : type;
    this.setState({toolType});
    useWorldEditorStore.getState().setPaintTool({type: toolType});
  }

  render() {

    const {toolType} = this.state;

    return (
      <>
        <div id="tile-container" style={{ display: 'flex', justifyContent: 'center', margin: '25px 0' }}>
          <div></div>
        </div>

        <hr />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ButtonGroup variant="contained" color="default" aria-label="contained primary button group">
            {
              [
                {type: PaintToolType.DRAW, Icon: FaPencilAlt}, 
                {type: PaintToolType.ERASE, Icon: FaEraser},
                {type: PaintToolType.FILL, Icon: FaFill},
                {type: PaintToolType.SELECT, Icon: FaRegSquare},
                {type: PaintToolType.PICK, Icon: FaEyeDropper},
              ].map(({type, Icon}) => {
                return <Button 
                  color={toolType === type ? 'primary' : null} 
                  onClick={() => this.handlePaintToolChange(type)}
                >
                  <Icon style={{fontSize: '1.5rem'}} />
                </Button>
              })
            }
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
