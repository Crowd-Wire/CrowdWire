import React, { Component, useState, useEffect } from "react";

import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

import MapManager from "phaser/MapManager";
import useWorldEditorStore, { Layer } from "stores/useWorldEditorStore";

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

import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import styles from 'assets/jss/my-kit-react/views/WorldEditorPage/tabHeaderStyle.js';

interface SubLayerProps {
  title: string;
  name: string;
  info: string;
}

const useLayerStyles = makeStyles({
  root: {
    margin: '2px 0',
    display: 'flex',
    cursor: 'pointer',
    backgroundColor: 'rgba(11, 19, 43, 0.5)',
    color: 'white',
  },
  title: {
    marginLeft: 32,
    padding: '0 10px',
    flexGrow: 1,
    fontSize: 14,
    fontWeight: 300,
  },
  buttons: {
    display: 'flex',
  },
  icon: {
    fontSize: 16,
    margin: '0 7px',
  },
  tooltip: {
    backgroundColor: 'rgba(11, 19, 43, 1)',
    fontSize: '0.8rem',
  },
});

const SubLayer: React.FC<SubLayerProps> = ({ title, name, info }) => {
  const classes = useLayerStyles();
  let visible = useWorldEditorStore(state => state.layers[name].visible);
  let blocked = useWorldEditorStore(state => state.layers[name].blocked);
  let selected = useWorldEditorStore(state => state.layers[name].active);

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

  const handleSelected = (event) => {
    event.stopPropagation();
    if (event.ctrlKey) {
      useWorldEditorStore.setState(state => {
        state.layers[name].active = true;
      });
    } else {
      useWorldEditorStore.setState(state => {
        const layers = state.layers;
        for (const n of Object.keys(layers))
          layers[n].active = n === name;
        return { layers };
      });
    }
  }

  return (
    <div
      className={classes.root}
      style={selected ? { backgroundColor: "#2B9BFD" } : {}}
      onClick={handleSelected}
    >
      <div className={classes.title}>
        {title}
      </div>
      <div className={classes.buttons}>
        <div>
          <Tooltip
            title={info}
            placement="bottom-end"
            classes={{ tooltip: classes.tooltip }}
          >
            <InfoOutlinedIcon className={classes.icon} style={{ fontSize: 14 }} />
          </Tooltip>
        </div>
        <div onClick={handleVisible}>
          {visible ?
            <VisibilityIcon className={classes.icon} /> :
            <VisibilityOffIcon className={classes.icon} />
          }
        </div>
        <div onClick={handleBlocked}>
          {blocked ?
            <LockIcon className={classes.icon} /> :
            <LockOpenIcon className={classes.icon} />
          }
        </div>
      </div>
    </div>
  );
}


interface LayerGroupProps {
  title: string;
  Icon: any,
  names: string[],
  children?: React.ReactNode | React.ReactNode[],
}

const useLayerGroupStyles = makeStyles({
  ...styles,
  root: {
    boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
    margin: '2px 0',
    overflow: 'hidden',
    cursor: 'pointer',
    '&:first-of-type': {
      marginTop: 4,
    },
    color: 'white',
  },
  subroot: {
    backgroundColor: 'rgba(11, 19, 43, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    padding: '4px 0',
  },
  iconroot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    color: "#9c27b0"
  },
  textroot: {
    padding: '0 10px',
    fontSize: 16,
    fontWeight: 400,
    display: 'block',
    whiteSpace: 'nowrap',
  },
  icon: {
    fontSize: 18,
    margin: '0 6px',
  },
  body: {
    display: 'flex',
  },
  leftDivider: {
    borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
  },
  rightDivider: {
    borderRight: '1px solid rgba(255, 255, 255, 0.3)',
  }

});

const LayerGroup: React.FC<LayerGroupProps> = ({ title, Icon, names, children }) => {
  const classes = useLayerGroupStyles();
  const [visible, setVisible] = useState(true);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    handleLayerChange(Object.entries(useWorldEditorStore.getState().layers));
    const unsubscribe = useWorldEditorStore.subscribe(
      handleLayerChange, state => Object.entries(state.layers));

    return (() => {
      unsubscribe();
    })
  })

  const handleLayerChange = (layers: [string, Layer][]) => {
    setVisible(
      layers.some(([name, layer]) => names.includes(name) && layer.visible));
    setLocked(
      !layers.some(([name, layer]) => names.includes(name) && !layer.blocked));
    setSelected(
      !layers.some(([name, layer]) => names.includes(name) && !layer.active));

    // console.log(
    //   !layers.some(([name, layer]) => {console.log(layer); return names.includes(name) && !layer.active;})
    // );
  }

  const handleVisible = () => {
    useWorldEditorStore.setState(state => {
      const layers = state.layers;
      for (const name of names)
        layers[name].visible = !visible;
      return { layers };
    });
  }

  const handleLocked = () => {
    useWorldEditorStore.setState(state => {
      const layers = state.layers;
      for (const name of names)
        layers[name].blocked = !locked;
      return { layers };
    });
  }

  const handleSelected = (event) => {
    event.stopPropagation();
    if (event.ctrlKey) {
      useWorldEditorStore.setState(state => {
        const layers = state.layers;
        for (const name of names)
          layers[name].active = true;
        return { layers };
      });
    } else {
      useWorldEditorStore.setState(state => {
        const layers = state.layers;
        for (const name of Object.keys(layers))
          layers[name].active = names.includes(name);
        return { layers };
      });
    }
  }

  return (
    <div className={classes.root} onClick={handleSelected}>
      <div className={classes.subroot} style={selected ? { backgroundColor: "#2B9BFD" } : {}}>
        <div className={classes.body}>
          <div className={classes.rootLeft}>
            <div className={classNames(classes.iconroot, classes.rightDivider)}>
              <Icon />
            </div>
            <div className={classes.textroot}>
              {title}
            </div>
          </div>
          <div className={classes.rootRight}>
            <div className={classes.leftDivider} onClick={handleVisible}>
              {visible ?
                <VisibilityIcon className={classes.icon} /> :
                <VisibilityOffIcon className={classes.icon} />
              }
            </div>
            <div className={classes.leftDivider} onClick={handleLocked}>
              {locked ?
                <LockIcon className={classes.icon} /> :
                <LockOpenIcon className={classes.icon} />
              }
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}


interface LayersTabState {
  ready: boolean;
}

class LayersTab extends Component<{}, LayersTabState> {
  subscriptions: any;

  constructor(props) {
    super(props);
    this.subscriptions = [];

    this.state = {
      ready: false,
    }
  }

  componentDidMount() {
    if (useWorldEditorStore.getState().ready)
      this.setState({ ready: true });
    else
      this.subscriptions.push(useWorldEditorStore.subscribe(
        () => this.setState({ ready: true }), state => state.ready));
  }

  componentWillUnmount() {
    this.subscriptions.forEach((unsub) => unsub());
  }

  handleActiveLayer = () => {
    useWorldEditorStore.getState().setLayers({ active: false });
  }

  render() {
    const { ready } = this.state;

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        onClick={this.handleActiveLayer}
      >
        <LayerGroup title="Wall Layer" names={['__Float', '__Collision']} Icon={HomeWorkIcon} />
        <LayerGroup title="Conference Layer" names={['__Conference']} Icon={VideocamIcon} />
        <LayerGroup title="Object Layer" names={['Object', 'ObjectCollision']} Icon={CategoryIcon} />
        <LayerGroup title="Tile Layer" names={['Float', 'Collision', 'Ground2', 'Ground']} Icon={GridOnIcon} >
          {ready && (
            <>
              <SubLayer title="Floating Tiles" name='Float' info="Tiles that float over everything" />
              <SubLayer title="Collision Tiles" name='Collision' info="Tiles that are collidable" />
              <SubLayer title="Surface Tiles" name='Ground2' info="Tiles which stand on top of Floor Tiles" />
              <SubLayer title="Floor Tiles" name='Ground' info="Tiles which make the world ground" />
            </>
          )}
        </LayerGroup>

      </div>
    );
  }
}

export default LayersTab;
