import React, { Component } from "react";

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import {API_BASE} from "config";


interface ObjectsTabState {

}


class ObjectsTab extends Component<{}, ObjectsTabState> {
    subscriptions: any[];
    mapManager: MapManager;

    constructor(props) {
        super(props);
        this.subscriptions = [];
        
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
        return 'ObjectsTab';
    }
}

export default ObjectsTab;
