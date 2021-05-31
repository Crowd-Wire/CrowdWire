import React, { Component } from "react";

import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";
import { cyrb53Hash, intToHex, hexToRGB } from "utils/color.js";

import { API_BASE } from "config";


interface ConferencesTabState {
  conferenceId: string;
  conferences: string[];
}


class ConferencesTab extends Component<{}, ConferencesTabState> {
  subscriptions: any[];
  mapManager: MapManager;

  constructor(props) {
    super(props);
    this.subscriptions = [];

    this.state = {
      conferenceId: 'C1',
      conferences: ['C1'],
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
    this.forceUpdate();
  }

  handleChange = (event) => {
    const value = event.target.value;
    this.setState({ conferenceId: value });
  }

  render() {
    const { conferenceId, conferences } = this.state;

    const ConferenceTile = withStyles({
      root: {
        width: 32,
        height: 32,
        backgroundImage: `url(${API_BASE + "static/maps/tilesets/conference-tile.png"})`,
        transform: "scale(2.5)",
        margin: "40px auto",
        boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
        backgroundRepeat: "no-repeat",
        "&:before": {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: `rgba(${Object.values(hexToRGB(intToHex(cyrb53Hash(conferenceId, 129)))).join(',')},0.5)`,
        }
      },
    // @ts-expect-error
    })(({ classes }) => (
      <div
        className={classes.root}
      ></div>
    ));

    return (
      <> 
        <ConferenceTile />

        <hr />

        <FormControl style={{ marginLeft: 15, marginTop: 15 }}>
          <InputLabel htmlFor="input-conference">Conference ID:</InputLabel>
          <Input
            value={conferenceId}
            onChange={this.handleChange}
            inputProps={{
              id: 'input-conference',
            }}
          />
        </FormControl>
      </>
    );
  }
}

export default ConferencesTab;
