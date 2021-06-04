import React, { Component } from "react";

import useWorldEditorStore, { ToolType } from "stores/useWorldEditorStore";

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
      toolType: ToolType.DRAW,
      tileStyle: {},
    }
    useWorldEditorStore.getState().setTool({ type: ToolType.DRAW });

    this.subscriptions.push(useWorldEditorStore.subscribe(
      this.handleActiveChange, state => Object.entries(state.active)));
  }

  componentWillUnmount() {
    this.subscriptions.forEach((unsub) => unsub());
  }

  handleActiveChange = (active: string[][]) => {
    for (const [key, value] of active) {
      if (value) {
        let tileStyle = {};
        switch (key) {
          case 'tile':
          case 'object':
          case 'conference':
            tileStyle = useWorldEditorStore.getState().tiles[value].style;
            break;
          case 'wall':
            break;
        }
        this.setState({ tileStyle });
        break;
      }
    }
  }

  handlePaintToolChange = (toolType: ToolType) => {
    this.setState({ toolType });
    useWorldEditorStore.getState().setTool({ type: toolType });
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
                { type: ToolType.DRAW, Icon: FaPencilAlt },
                { type: ToolType.ERASE, Icon: FaEraser },
                { type: ToolType.FILL, Icon: FaFill },
                { type: ToolType.SELECT, Icon: FaRegSquare },
                { type: ToolType.PICK, Icon: FaEyeDropper },
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
