import React, { Component, useState } from "react";

import classNames from "classnames";

import VideocamTwoToneIcon from '@material-ui/icons/VideocamTwoTone';
import Input from '@material-ui/core/Input';

import TabHeader from './TabHeader';
import useWorldEditorStore, { Conference, ToolType } from "stores/useWorldEditorStore";
import { cyrb53Hash, intToHex, hexToRGB } from "utils/color.js";

import { makeStyles } from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import MapManager from "phaser/MapManager";
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';

interface ConferenceItemProps {
  id: string;
  name: string;
  color: string;
  handle: (id: string, name: string, del?: boolean) => void;
  active: boolean;
}

const useConferenceItemStyles = makeStyles({
  activeRoot: {
    backgroundColor: "rgba(11, 19, 43, 0.8) !important",
    color: 'white',
  },
  root: {
    padding: '.25rem .75rem',
    display: 'flex',
    "&:hover": {
      backgroundColor: "rgba(11, 19, 43, 0.5)",
      color: 'white',
    },
    "&[active]": {
    }
  },
  text: {
    // whiteSpace: 'nowrap',
    fontSize: '1rem',
    fontWeight: 400,
  },
  color: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
  },
  square: {
    marginLeft: 'auto',
    width: 16,
    height: 16,
    marginRight: '.75rem',
  }
})

const ConferenceItem: React.FC<ConferenceItemProps> = (
  { id, name, color, handle, active }) => {
  const classes = useConferenceItemStyles();
  const [toggle, setToggle] = useState(true);

  const handleChange = (event) => {
    const value = event.target.value;
    handle(id, value);
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      setToggle(true);
      event.preventDefault();
      event.stopPropagation();
    }
  }

  const handleDel = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handle(id, '', true);
  }

  return (
    <div
      className={classNames(classes.root, { [classes.activeRoot]: active })}
      onClick={() => handle(id, name)}
    >
      <div>
        {
          toggle ? (
            <span
              className={classes.text}
              onDoubleClick={() => setToggle(false)}
            >{name}</span>
          ) : (
            <Input
              autoFocus
              inputProps={{ maxLength: 30 }}
              type="text"
              value={name}
              style={{ color: 'white' }}
              onChange={handleChange}
              onBlur={() => setToggle(true)}
              onKeyDown={handleKeyDown}
            />
          )
        }
      </div>
      <div className={classes.color}>
        <div
          className={classes.square}
          style={{ backgroundColor: color }}
        ></div>
        <RemoveIcon
          onClick={handleDel}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}

const useConferenceLayerStyles = makeStyles({
  root: {
    padding: '.25rem 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  icon: {
    padding: '0 .25rem',
    "&:last-of-type": {
      padding: '0 .75rem 0 .25rem',
    }
  }
})

const ConferenceLayer: React.FC<{ children: React.ReactNode[] }> = ({ children }) => {
  const classes = useConferenceLayerStyles();

  return (
    <div className={classes.root}>
      {children}
    </div>
  );
}

interface ConferencesTabState {
  activeConference: string;
  conferences: Record<string, Conference>;
}


class ConferencesTab extends Component<{}, ConferencesTabState> {
  static curConference: number = 0;

  mapManager: MapManager;
  subscriptions: any[];

  constructor(props) {
    super(props);
    this.subscriptions = [];

    this.state = {
      activeConference: null,
      conferences: {},
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

  addConference = () => {
    const conferences = this.state.conferences;
    const id = `C${++ConferencesTab.curConference}`;
    conferences[id] = {
      name: `Conference C${Object.keys(conferences).length}`,
      color: `#${intToHex(cyrb53Hash(id, 129))}`
    };
    const color = conferences[id].color;
    const style = {
      backgroundColor: `rgba(${Object.values(hexToRGB(color)).join(',')},0.4)`,
      border: `1px solid ${color}`,
    };
    useWorldEditorStore.getState().addTile(id, { style });
    useWorldEditorStore.getState().setState({ conferences });
    this.setState({ conferences });
  }

  handleReady = () => {
    this.mapManager = new MapManager();
    const { conferences } = useWorldEditorStore.getState();
    ConferencesTab.curConference = Object.keys(conferences)
      .map(k => parseInt(k.substr(1), 10))
      .sort(((a, b) => a - b))
      .pop() || -1;
    Object.keys(conferences).forEach((cid) => {
      const color = conferences[cid].color;
      const style = {
        backgroundColor: `rgba(${Object.values(hexToRGB(color)).join(',')},0.4)`,
        border: `1px solid ${color}`
      };
      useWorldEditorStore.getState().addTile(cid, { style });
    });
    this.setState({ conferences });
  }

  handleChange = (id: string, name: string, del?: boolean): void => {
    if (del) {
      const conferences = this.state.conferences;
      let activeConference = this.state.activeConference;
      delete conferences[id];
      useWorldEditorStore.getState().setState({ conferences });
      this.setState({ conferences });

      if (id === activeConference) {
        activeConference = null;
        useWorldEditorStore.getState().setLayer('__Conference', { active: false });
        useWorldEditorStore.getState().remActive('conference');
        this.setState({ activeConference });
      }
    } else {
      const conferences = this.state.conferences;
      conferences[id].name = name;

      const props = this.mapManager.tilesetProps['__CONFERENCE_' + id];
      if (props.properties) {
        props.properties.name = name;
      } else {
        props.properties = { name };
      }
      useWorldEditorStore.getState().setTool({ type: ToolType.DRAW });
      useWorldEditorStore.getState().setState({ conferences });
      useWorldEditorStore.setState(state => {
        const layers = state.layers;
        for (const name of Object.keys(layers))
          layers[name].active = name === '__Conference';
        return { layers };
      });
      useWorldEditorStore.setState({ activeLayer: 'Conference Layer' });
      useWorldEditorStore.getState().setActive('conference', id);
      this.setState({ conferences, activeConference: id });
    }
  }

  render() {
    const { activeConference, conferences } = this.state;

    return (
      <>
        <TabHeader names={['__Conference']} Icon={VideocamTwoToneIcon} />
        <ConferenceLayer>
          {Object.entries(conferences).map(([id, conference], index) => (
            <ConferenceItem
              key={index}
              id={id} {...conference}
              handle={this.handleChange}
              active={activeConference === id}
            />
          ))}

          <AddIcon
            onClick={this.addConference}
            style={{ cursor: 'pointer', margin: '.25rem .75rem', float: 'right' }}
          />
        </ConferenceLayer>
      </>
    );
  }
}

export default ConferencesTab;
