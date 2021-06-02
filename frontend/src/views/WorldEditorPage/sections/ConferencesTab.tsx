import React, { Component, useState } from "react";

import classNames from "classnames";
import Input from '@material-ui/core/Input';

import MapManager from "phaser/MapManager";
import useWorldEditorStore, { Conference } from "stores/useWorldEditorStore";
import { cyrb53Hash, intToHex, hexToRGB } from "utils/color.js";

import { makeStyles } from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';


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
    marginRight: 10,
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

interface ConferencesTabState {
  activeConference: string;
  conferences: Record<string, Conference>;
}


class ConferencesTab extends Component<{}, ConferencesTabState> {
  static curConference: number = 0;

  subscriptions: any[];
  mapManager: MapManager;

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
    
    const { conferences, activeConference } = useWorldEditorStore.getState();
    ConferencesTab.curConference = Object.keys(conferences).length;
    this.setState({ conferences, activeConference });
  }

  componentDidUpdate() {
    const activeConference = this.state.activeConference;
    if (activeConference)
      useWorldEditorStore.getState().setPaintTool({ tileId: activeConference });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((unsub) => unsub());
  }

  addConference = () => {
    const conferences = this.state.conferences;
    const id = `C${ConferencesTab.curConference++}`;
    conferences[id] = {
      name: `Conference #${id}`,
      color: `#${intToHex(cyrb53Hash(id, 129))}`
    }
    this.setState({conferences});
    useWorldEditorStore.getState().setState({ conferences });
  }

  handleReady = () => {
    this.mapManager = new MapManager();
    this.forceUpdate();
  }

  handleChange = (id: string, name: string, del?: boolean): void => {
    if (del) {
      const conferences = this.state.conferences;
      let activeConference = this.state.activeConference;
      delete conferences[id];
      if (id === activeConference) {
        activeConference = null;
        useWorldEditorStore.getState().setPaintTool({ tileId: null });
      }
      this.setState({ conferences, activeConference });
      useWorldEditorStore.getState().setState({ conferences, activeConference });
    } else {
      const conferences = this.state.conferences;
      conferences[id].name = name;
      this.setState({ conferences, activeConference: id });
      useWorldEditorStore.getState().setState({ conferences, activeConference: id });
    }
  }

  render() {
    const { activeConference, conferences } = this.state;
    const color = conferences[activeConference]?.color;

    const conferenceTileStyles = color && {
      display: 'none',
      width: 32,
      height: 32,
      transform: "scale(2.5)",
      backgroundColor: `rgba(${Object.values(hexToRGB(color)).join(',')},0.4)`,
      border: `1px solid ${color}`,
      margin: "40px auto",
      boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
    };

    return (
      <>
        <div
          id={`tile-${activeConference}`}
          style={conferenceTileStyles}
        ></div>

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

      </>
    );
  }
}

export default ConferencesTab;
