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
  const classes = useLayerStyles();
  let visible = useWorldEditorStore(state => state.layers[name].visible);
  let blocked = useWorldEditorStore(state => state.layers[name].blocked);
  
  const handleVisible = (event) => {
    event.stopPropagation();
    useWorldEditorStore.setState(state => {
      state.layers[name].visible = !visible;
    });
  }

  const handleBlocked = (event) => {
    event.stopPropagation();
    useWorldEditorStore.setState(state => {
      state.layers[name].blocked = !blocked;
    });
  }

  return (
    <div className={classes.root} style={{ backgroundColor: selected ? "#3f51b5" : 'white' }}>
      {object ? <CategoryIcon color="secondary" /> : <GridOnIcon color="secondary" />}
      <div className={classes.name}>
        {name}
      </div>
      <div className={classes.buttons}>
        <div onClick={handleVisible}>
          {visible ? <VisibilityIcon className={classes.button} /> : <VisibilityOffIcon className={classes.button} />}
        </div>
        <div onClick={handleBlocked}>
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
    border: '2px solid rgb(11, 19, 43)',
    backgroundColor: 'rgba(11, 19, 43, 0.8)',
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
  activeLayers: Set<string>;
}

class LayersTab extends Component<{}, LayersTabState> {
  subscriptions: any;
  mapManager: MapManager;

  constructor(props) {
    super(props);
    this.subscriptions = [];

    this.state = {
      activeLayers: new Set(),
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

  handleActiveLayer = (event, activeLayer) => {
    event.stopPropagation();
    useWorldEditorStore.getState().setState({ activeLayer });
    
    if (event.ctrlKey) {
      this.setState(state => {
        const activeLayers = state.activeLayers;
        if (activeLayers.has(activeLayer)) {
          activeLayers.delete(activeLayer);
          useWorldEditorStore.getState().setLayer(activeLayer, { highlighted: false });
        }
        else {
          activeLayers.add(activeLayer);
          useWorldEditorStore.getState().setLayer(activeLayer, { highlighted: true });
        }
        return { activeLayers };
      });
    } else {
      useWorldEditorStore.getState().setLayers({ highlighted: false });
      useWorldEditorStore.getState().setLayer(activeLayer, { highlighted: true });

      this.setState({ activeLayers: new Set([activeLayer]) });
    }
  }

  render() {
    const { activeLayers } = this.state;

    return (
      <div 
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }} 
        onClick={(e) => this.handleActiveLayer(e, null)}
      >
        <LayerGroup name="Collision Layers" info="Every tile and object on these layers is collidable">
          {
            this.mapManager && this.mapManager.map.objects.map((layer, index) => {
              if (layer.name.includes("Collision")) {
                return (
                  <div key={index} onClick={(e) => this.handleActiveLayer(e, layer.name)}>
                    <Layer name={layer.name} object={true} selected={activeLayers.has(layer.name)} />
                  </div>
                );
              }
            }).reverse()
          }
          {
            this.mapManager && this.mapManager.map.layers.map((layer, index) => {
              if (layer.name.includes("Collision")) {
                return (
                  <div key={index} onClick={(e) => this.handleActiveLayer(e, layer.name)}>
                    <Layer name={layer.name} object={false} selected={activeLayers.has(layer.name)} />
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
                  <div key={index} onClick={(e) => this.handleActiveLayer(e, layer.name)}>
                    <Layer name={layer.name} object={true} selected={activeLayers.has(layer.name)} />
                  </div>
                );
              }
            }).reverse()
          }
          {
            this.mapManager && this.mapManager.map.layers.map((layer, index) => {
              if (layer.name.includes("Ground")) {
                return (
                  <div key={index} onClick={(e) => this.handleActiveLayer(e, layer.name)}>
                    <Layer name={layer.name} object={false} selected={activeLayers.has(layer.name)} />
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
                  <div key={index} onClick={(e) => this.handleActiveLayer(e, layer.name)}>
                    <Layer name={layer.name} object={false} selected={activeLayers.has(layer.name)} />
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
