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
    display: 'flex'
  },
  name: {
    flexGrow: 1,
    paddingLeft: 10,
    fontSize: '1.125rem'
  },
  buttons: {
    display: 'flex',
    cursor: 'pointer',
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
    <div className={classes.root} style={{backgroundColor: selected ? "#3f51b5": 'lightgray'}}>
      {object ? <CategoryIcon color="secondary" /> : <GridOnIcon color="secondary" />}
      <div className={classes.name}>
        {name}
      </div>
      <div className={classes.buttons}>
        <div onClick={() => setVisible(visible => !visible)}>
          {visible ? <VisibilityIcon className={classes.button} /> : <VisibilityOffIcon className={classes.button} />}
        </div>
        <div onClick={() => setBlocked(blocked => !blocked)}>
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

const LayerGroup: React.FC<LayerGroupProps> = ({ name, info, children }) => {

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid lightgray',
        margin: 6, 
        borderRadius: 5,
      }}
    >
      <div style={{display: 'flex', fontSize: '1rem', margin: 3}}>
        {name}
        <Tooltip
          title={info}
          placement="bottom"
        >
          <InfoIcon style={{fontSize: '1rem', marginLeft: 5}} />
        </Tooltip>
      </div>
      {children}
    </div>
  );
}


class LayersTab extends Component<{}, {}> {
  subscriptions: any;
  mapManager: MapManager;

  constructor(props) {
    super(props);
    this.subscriptions = [];

    this.state = {
      activeLayer: 'Ground',
    }

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
    this.setState({activeLayer})
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        <LayerGroup name="Collision Layers" info="Every tile on these layers are collidable">
          {
            this.mapManager && this.mapManager.map.tilesets.map((tileset) => {
              if (tileset.total != 0 && tileset.name.includes("Collision")) {
                return (
                  <div onClick={() => this.handleActiveLayer(tileset.name)}>
                    <Layer name={tileset.name} object={false} selected={false} />
                  </div>
                );
              }
            })
          }
          {
            this.mapManager && this.mapManager.map.imageCollections.map((collection) => {
              if (collection.name.includes("Collision")) {
                return (
                  <div onClick={() => this.handleActiveLayer(collection.name)}>
                    <Layer name={collection.name} object={true} selected={false} />
                  </div>
                );
              }
            })
          }
        </LayerGroup>
        <LayerGroup name="Ground Layers" info="Every tile on these layers are collidable">
          {
            this.mapManager && this.mapManager.map.tilesets.map((tileset) => {
              if (tileset.total != 0 && tileset.name.includes("Ground")) {
                return <Layer name="Layer1" object={true} selected={true} />
              }
            })
          }
          {
            this.mapManager && this.mapManager.map.imageCollections.map((collection) => {
              if (collection.name.includes("Collision")) {
                return (
                  <div onClick={() => this.handleActiveLayer(collection.name)}>
                    <Layer name={collection.name} object={true} selected={false} />
                  </div>
                );
              }
            })
          }
        </LayerGroup>
      </div>
    );
  }
}

export default LayersTab;
