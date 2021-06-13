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
import VideocamIcon from '@material-ui/icons/Videocam';
import HomeWorkIcon from '@material-ui/icons/HomeWork';

import GridOnTwoToneIcon from '@material-ui/icons/GridOnTwoTone';
import CategoryTwoToneIcon from '@material-ui/icons/CategoryTwoTone';
import VideocamTwoToneIcon from '@material-ui/icons/VideocamTwoTone';
import HomeWorkTwoToneIcon from '@material-ui/icons/HomeWorkTwoTone';

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
  map: any;
}

class LayersTab extends Component<{}, LayersTabState> {
  subscriptions: any;

  constructor(props) {
    super(props);
    this.subscriptions = [];

    this.state = {
      activeLayers: new Set(),
      map: {},
    }
  }

  componentDidMount() {
    if (useWorldEditorStore.getState().ready)
      this.handleReady();
    else
      this.subscriptions.push(useWorldEditorStore.subscribe(
        this.handleReady, state => state.ready));

    this.subscriptions.push(useWorldEditorStore.subscribe(
      this.handleReady, state => state.layers));

    this.setState({
      activeLayers: new Set(
        Object.entries(useWorldEditorStore.getState().layers)
          .filter(([_, l]) => l.active)
          .map(([name, _]) => name) as string[]
      )
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((unsub) => unsub());
  }

  handleReady = () => {
    this.setState({ map: new MapManager().map });
  }

  handleActiveLayer = (event, activeLayer) => {
    event.stopPropagation();
    useWorldEditorStore.getState().setState({ activeLayer });

    if (event.ctrlKey) {
      const activeLayers = this.state.activeLayers;
      if (activeLayers.has(activeLayer)) {
        activeLayers.delete(activeLayer);
        useWorldEditorStore.getState().setLayer(activeLayer, { active: false });
      }
      else {
        activeLayers.add(activeLayer);
        useWorldEditorStore.getState().setLayer(activeLayer, { active: true });
      }
      this.setState({ activeLayers });
    } else {
      useWorldEditorStore.getState().setLayers({ active: false });
      useWorldEditorStore.getState().setLayer(activeLayer, { active: true });

      this.setState({ activeLayers: new Set([activeLayer]) });
    }
  }

  render() {
    const { activeLayers, map } = this.state;

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        onClick={(e) => this.handleActiveLayer(e, null)}
      >
        <LayerGroup name="Float Layers" info="Every tile on these layers float over everything">
          {
            map.layers?.map((layer, index) => {
              if (!layer.name.startsWith('_') && layer.name.includes("Float")) {
                return (
                  <div key={index} onClick={(e) => this.handleActiveLayer(e, layer.name)}>
                    <Layer name={layer.name} object={false} selected={activeLayers.has(layer.name)} />
                  </div>
                );
              }
            }).reverse()
          }
        </LayerGroup>
        <LayerGroup name="Collision Layers" info="Every tiles and objects on these layers are collidable">
          {
            map.objects?.map((layer, index) => {
              if (!layer.name.startsWith('_') && layer.name.includes("Collision")) {
                return (
                  <div key={index} onClick={(e) => this.handleActiveLayer(e, layer.name)}>
                    <Layer name={layer.name} object={true} selected={activeLayers.has(layer.name)} />
                  </div>
                );
              }
            }).reverse()
          }
          {
            map.layers?.map((layer, index) => {
              if (!layer.name.startsWith('_') && layer.name.includes("Collision")) {
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
            map.objects?.map((layer, index) => {
              if (!layer.name.startsWith('_') && !layer.name.includes("Collision")) {
                return (
                  <div key={index} onClick={(e) => this.handleActiveLayer(e, layer.name)}>
                    <Layer name={layer.name} object={true} selected={activeLayers.has(layer.name)} />
                  </div>
                );
              }
            }).reverse()
          }
          {
            map.layers?.map((layer, index) => {
              if (!layer.name.startsWith('_') && layer.name.includes("Ground")) {
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
