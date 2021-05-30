import React, { Component, useState } from "react";

import { makeStyles } from '@material-ui/core/styles';

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import GridOnIcon from '@material-ui/icons/GridOn';
import CategoryIcon from '@material-ui/icons/Category';




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
  }
});


const Layer: React.FC<LayerProps> = ({ name, object, selected }) => {
  const [visible, setVisible] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const classes = useLayerStyles();

  return (
    <div className={classes.root} style={{backgroundColor: selected ? "#3f51b5": 'lightgray'}}>
      {object ? <CategoryIcon color="primary" /> : <GridOnIcon />}
      <div className={classes.name}>
        {name}
      </div>
      <div className={classes.buttons}>
        <div onClick={() => setVisible(visible => !visible)}>
          {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
        </div>
        <div onClick={() => setBlocked(blocked => !blocked)}>
          {blocked ? <LockIcon /> : <LockOpenIcon />}
        </div>
      </div>
    </div>
  );
}



interface LayersTabState {

}


class LayersTab extends Component<{}, LayersTabState> {
  unsubscribe: any;
  mapManager: MapManager;

  constructor(props) {
    super(props);

    this.unsubscribe = useWorldEditorStore.subscribe(
      this.handleReady, state => state.ready);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleReady = () => {
    this.mapManager = new MapManager();
    this.forceUpdate()
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {
          this.mapManager && this.mapManager.map.tilesets.map((tileset) => {
            if (tileset.total != 0) {
              return <Layer name="Layer1" object={true} selected={true} />
            }
          })
        }
        <Layer name="Layer2" object={false} selected={true} />
        <Layer name="Layer3" object={false} selected={false} />
        <Layer name="Layer4" object={true} selected={false} />
      </div>
    );
  }
}

export default LayersTab;
