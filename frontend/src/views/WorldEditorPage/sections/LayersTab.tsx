import React, { Component, useState } from "react";

import { makeStyles } from '@material-ui/core/styles';

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import Tooltip from "@material-ui/core/Tooltip";

import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import GridOnIcon from '@material-ui/icons/GridOn';
import CategoryIcon from '@material-ui/icons/Category';
import InfoIcon from '@material-ui/icons/Info';
import { FaBullseye } from "react-icons/fa";



interface LayerProps {
  name: string;
  object: boolean;
  selected: boolean;
}

const useLayerStyles = makeStyles({
  root: {
    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
    margin: 2,
    borderRadius: 5,
    display: 'flex',
    cursor: 'pointer',
  },
  name: {
    flexGrow: 1,
    paddingLeft: 10,
    fontSize: '1rem'
  },
  buttons: {
    display: 'flex',
  },
  button: {
    fontSize: '1.125rem',
    margin: '0 3px',
  }
});

const Layer: React.FC<LayerProps> = ({ name, object, selected }) => {
  const [visible, setVisible] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const classes = useLayerStyles();

  return (
    <div className={classes.root} style={{ backgroundColor: selected ? "#3f51b5" : 'white' }}>
      {object ? <CategoryIcon color="secondary" /> : <GridOnIcon color="secondary" />}
      <div className={classes.name}>
        {name}
      </div>
      <div className={classes.buttons}>
        <div onClick={(e) => {e.stopPropagation(); setVisible(visible => !visible)}}>
          {visible ? <VisibilityIcon className={classes.button} /> : <VisibilityOffIcon className={classes.button} />}
        </div>
        <div onClick={(e) => {e.stopPropagation(); setBlocked(blocked => !blocked)}}>
          {blocked ? <LockIcon className={classes.button} /> : <LockOpenIcon className={classes.button} />}
        </div>
      </div>
    </div>
  );
}


interface LayerGroupProps {
  name: string;
  info: string;
  children: React.ReactNode;
}

const useLayerGroupStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid black',
    backgroundColor: 'rgba(11, 19, 43, 1)',
    margin: 6,
    borderRadius: 5,
    padding: 5,
  },
  title: {
    display: 'flex',
    fontSize: '1.125rem',
    margin: 3,
    color: 'white',
  },
  tooltip: {
    backgroundColor: 'rgba(11, 19, 43, 1)',
    fontSize: '0.8rem',
  },
});

const LayerGroup: React.FC<LayerGroupProps> = ({ name, info, children }) => {
  const classes = useLayerGroupStyles();

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <div style={{ flexGrow: 1 }}>
          {name}
        </div>
        <Tooltip
          title={info}
          placement="bottom-end"
          classes={{ tooltip: classes.tooltip }}
        >
          <InfoIcon style={{ fontSize: '1rem', marginLeft: 5, }} />
        </Tooltip>
      </div>
      {children}
    </div>
  );
}


interface LayersTabState {
  activeLayer: string;
}

class LayersTab extends Component<{}, LayersTabState> {
  subscriptions: any;
  mapManager: MapManager;

  constructor(props) {
    super(props);
    this.subscriptions = [];

    this.state = {
      activeLayer: 'Ground',
    }
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
    this.mapManager = new MapManager();
    this.forceUpdate()
  }

  handleActiveLayer = (activeLayer) => {
    useWorldEditorStore.getState().setActiveLayer(activeLayer);
    this.setState({ activeLayer });
  }

  render() {
    const { activeLayer } = this.state;

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        <LayerGroup name="Collision Layers" info="Every tile and object on these layers is collidable">
          {
            this.mapManager && this.mapManager.map.objects.map((layer, index) => {
              if (layer.name.includes("Collision")) {
                return (
                  <div key={index} onClick={() => this.handleActiveLayer(layer.name)}>
                    <Layer name={layer.name} object={true} selected={layer.name === activeLayer} />
                  </div>
                );
              }
            }).reverse()
          }
          {
            this.mapManager && this.mapManager.map.layers.map((layer, index) => {
              if (layer.name.includes("Collision")) {
                return (
                  <div key={index} onClick={() => this.handleActiveLayer(layer.name)}>
                    <Layer name={layer.name} object={false} selected={layer.name === activeLayer} />
                  </div>
                );
              }
            }).reverse()
          }
        </LayerGroup>
        <LayerGroup name="Ground Layers" info="These layers are non collidable">
          {
            this.mapManager && this.mapManager.map.objects.map((layer, index) => {
              if (!layer.name.includes("Collision")) {
                return (
                  <div key={index} onClick={() => this.handleActiveLayer(layer.name)}>
                    <Layer name={layer.name} object={true} selected={layer.name === activeLayer} />
                  </div>
                );
              }
            }).reverse()
          }
          {
            this.mapManager && this.mapManager.map.layers.map((layer, index) => {
              if (layer.name.includes("Ground")) {
                return (
                  <div key={index} onClick={() => this.handleActiveLayer(layer.name)}>
                    <Layer name={layer.name} object={false} selected={layer.name === activeLayer} />
                  </div>
                );
              }
            }).reverse()
          }
        </LayerGroup>
        <LayerGroup name="Conference Layer" info="This layer is only meant for creating conference areas">
          {
            this.mapManager && this.mapManager.map.layers.map((layer, index) => {
              if (layer.name === "Room") {
                return (
                  <div key={index} onClick={() => this.handleActiveLayer(layer.name)}>
                    <Layer name={layer.name} object={false} selected={layer.name === activeLayer} />
                  </div>
                );
              }
            }).reverse()
          }
        </LayerGroup>
      </div>
    );
  }
}

export default LayersTab;
