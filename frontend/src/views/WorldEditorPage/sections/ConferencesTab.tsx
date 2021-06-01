import React, { Component, useState, useEffect, useRef } from "react";

import classNames from "classnames";
import Input from '@material-ui/core/Input';

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";
import { cyrb53Hash, intToHex, hexToRGB } from "utils/color.js";

import { makeStyles } from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';


interface ConferenceItemProps {
  id: string;
  name: string;
  color: string;
  handle: (id: string, name: string) => void;
  active: boolean;
}

const useConferenceItemStyles = makeStyles({
  activeRoot: {
    backgroundColor: "rgba(11, 19, 43, 0.8) !important",
    color: 'white',
  },
  root: {
    display: 'flex',
    "&:hover": {
      backgroundColor: "rgba(11, 19, 43, 0.5)",
      color: 'white',
    },
    "&[active]": {
    }
  },
  text: {
    fontSize: '1rem',
    "word-break": "break-all",
    fontWeight: 400,
  },
  color: {
    width: 10,
    height: 10,
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
      setToggle(true)
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <div
      className={classNames(classes.root, { [classes.activeRoot]: active })}
      onClick={() => handle(id, name)}
    >
      <div style={{ flexGrow: 1 }}>
        {
          toggle ? (
            <p
              className={classes.text}
              onDoubleClick={() => setToggle(false)}
            >{name}</p>
          ) : (
            <Input
              autoFocus
              type="text"
              value={name}
              style={{color: 'white'}}
              onChange={handleChange}
              onBlur={() => setToggle(true)}
              onKeyDown={handleKeyDown}
            />
          )
        }
      </div>
      <div
        className={classes.color}
        style={{ backgroundColor: color }}
      ></div>
    </div>
  );
}

interface Conference {
  name: string;
  color: string;
}

interface ConferencesTabState {
  activeConference: string;
  conferences: Record<string, Conference>;
}


class ConferencesTab extends Component<{}, ConferencesTabState> {
  static curConference: number;

  subscriptions: any[];
  mapManager: MapManager;

  constructor(props) {
    super(props);
    this.subscriptions = [];

    this.state = {
      activeConference: 'C1',
      conferences: { 
        'C1': { name: 'Conference #1', color: '#ff00ff' },
        'C2': { name: 'Conference #2', color: '#00ffff' },
        'C3': { name: 'Conference #3', color: '#00ff00' } 
      },
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
    this.setState(state => {
      const conferences = state.conferences;

    });
  }

  handleReady = () => {
    this.mapManager = new MapManager();
    this.forceUpdate();
  }

  handleChange = (id: string, name: string): void => {
    this.setState(state => {
      const conferences = state.conferences;
      conferences[id].name = name;
      return { conferences, activeConference: id };
    })
    // const value = event.target.value;
    // this.setState({ activeConference: value });
    // useWorldEditorStore.getState().setState({ activeConference: value });
  }

  render() {
    const { activeConference, conferences } = this.state;

    const hexColor = `#${intToHex(cyrb53Hash(activeConference, 129))}`;

    const conferenceTileStyles = {
      width: 32,
      height: 32,
      transform: "scale(2.5)",
      backgroundColor: `rgba(${Object.values(hexToRGB(hexColor)).join(',')},0.5)`,
      borderColor: `1px solid ${hexColor}`,
      margin: "40px auto",
      boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
      backgroundRepeat: "no-repeat",
    };

    return (
      <>
        <div
          id={`tile-${activeConference}`}
          style={conferenceTileStyles}
        ></div>

        <hr />

        {Object.entries(conferences).map(([id, conference]) => (
          <ConferenceItem
            id={id} {...conference}
            handle={this.handleChange}
            active={activeConference === id}
          />
        ))}

        <AddIcon />

      </>
    );
  }
}

export default ConferencesTab;
