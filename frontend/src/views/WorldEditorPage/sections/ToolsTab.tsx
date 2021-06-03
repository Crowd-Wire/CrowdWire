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
} from 'react-icons/fa';


interface ToolsTabState {
  toolType: string;
  tileStyle: Record<string, string>;
}

const tileStaticStyle = {
  width: 32,
  height: 32,
  transform: "scale(2.5)",
  margin: 15,
  boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
};


class ToolsTab extends Component<{}, ToolsTabState> {
  subscriptions: any[];

  constructor(props) {
    super(props);
    this.subscriptions = [];

    this.state = {
      toolType: PaintToolType.DRAW,
      tileStyle: {},
    }
    useWorldEditorStore.getState().setPaintTool({ type: PaintToolType.DRAW });

    this.subscriptions.push(useWorldEditorStore.subscribe(
      this.handleTileChange, state => state.activeTile));
  }

  componentWillUnmount() {
    this.subscriptions.forEach((unsub) => unsub());
  }

  handleTileChange = (tileId, prevTileId) => {
    console.log('activeTile')
    if (tileId === prevTileId)
      return;

    const tileStyle = useWorldEditorStore.getState().tiles[tileId].style;
    console.log(tileId,tileStyle )
    this.setState({ tileStyle });
    // const tileElem: any = document.getElementById(`tile-${tileId}`).cloneNode(true);
    // tileElem.removeAttribute('id');
    // tileElem.style["transform"] = "scale(2.5)";
    // tileElem.style["display"] = "";
    // tileElem.style["margin"] = "15px";
    // const tileContainer = document.getElementById("tile-container");
    // tileContainer.replaceChild(tileElem, tileContainer.childNodes[0]);
  }

  handlePaintToolChange = (toolType: PaintToolType) => {
    this.setState({ toolType });
    useWorldEditorStore.getState().setPaintTool({ type: toolType });
  }

  render() {
    const { toolType, tileStyle } = this.state;

    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '25px 0' }}>
          <div style={{ ...tileStaticStyle, ...tileStyle }}></div>
        </div>

        <hr />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ButtonGroup variant="contained" color="default" aria-label="contained primary button group">
            {
              [
                { type: PaintToolType.DRAW, Icon: FaPencilAlt },
                { type: PaintToolType.ERASE, Icon: FaEraser },
                { type: PaintToolType.FILL, Icon: FaFill },
                { type: PaintToolType.SELECT, Icon: FaRegSquare },
                { type: PaintToolType.PICK, Icon: FaEyeDropper },
              ].map(({ type, Icon }, index) => {
                return (
                  <Button
                    key={index}
                    color={toolType === type ? 'primary' : null}
                    onClick={() => this.handlePaintToolChange(type)}
                  >
                    <Icon style={{ fontSize: '1.5rem' }} />
                  </Button>
                )
              })
            }
          </ButtonGroup>
        </div>
      </>
    );
  }
}

export default ToolsTab;
