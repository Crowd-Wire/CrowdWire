import React, { Component, useState } from "react";

import classNames from "classnames";
import Input from '@material-ui/core/Input';

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
        useWorldEditorStore.getState().remActive('conference');
        this.setState({ activeConference });
      }
    } else {
      const conferences = this.state.conferences;
      conferences[id].name = name;

      useWorldEditorStore.getState().setState({ conferences });
      useWorldEditorStore.getState().setActive('conference', id);
      this.setState({ conferences, activeConference: id });
    }
  }

  render() {
    const { activeConference, conferences } = this.state;

    return (
      <>
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
