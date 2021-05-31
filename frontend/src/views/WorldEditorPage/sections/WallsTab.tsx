import React, { Component } from "react";

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import { API_BASE } from "config";


interface WallsTabState {

}


class WallsTab extends Component<{}, WallsTabState> {
  subscriptions: any[];
  mapManager: MapManager;

  constructor(props) {
    super(props);
    this.subscriptions = [];
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

  render() {
    return 'WallsTab';
  }
}

export default WallsTab;
