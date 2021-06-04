import React, { Component } from "react";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import MapManager from "phaser/MapManager";
import useWorldEditorStore from "stores/useWorldEditorStore";

import { API_BASE } from "config";


interface ObjectsTabState {
  filterType: string;
  collectionObjects: Record<string, React.ReactNode[]>;
}

const objectStyle = {
  transform: "scale(1.5)",
  margin: 15,
  boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
}


class ObjectsTab extends Component<{}, ObjectsTabState> {
  subscriptions: any[];
  mapManager: MapManager;

  constructor(props) {
    super(props);
    this.subscriptions = [];

    this.state = {
      filterType: '',
      collectionObjects: {},
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
    const mapManager = new MapManager();

    const collectionObjects = {};
    for (const collection of mapManager.map.imageCollections) {
      if (!collection.name.startsWith('_')) {
        // Not private
        const objects = [];

        for (const object of collection.images) {
          const { gid, image } = object;
          const style = {
            backgroundImage: `url(${API_BASE + "static/maps/" + image})`,
            backgroundPosition: 'center',
            backgroundSize: 'contain, cover',
            backgroundRepeat: "no-repeat",
          };
          useWorldEditorStore.getState().addTile(gid, { style });
          objects.push(
            <div
              key={gid}
              onClick={() => this.handleClick(gid)}
              style={{
                width: 32,
                height: 32,
                ...style,
                ...objectStyle,
              }}
            ></div>
          );                   
        }
        collectionObjects[collection.name] = objects;
      }
    }
    this.setState({ collectionObjects });
  }

  handleSelectChange = (event: React.ChangeEvent<{ value: string }>) => {
    this.setState({ filterType: event.target.value });
  }

  handleClick = (id: string) => {
    useWorldEditorStore.getState().setActive('object', id);
  }

  render() {
    const { filterType, collectionObjects } = this.state;

    return (
      <>
        <FormControl style={{ marginLeft: 15, marginTop: 15 }}>
          <InputLabel htmlFor="select-collection">Collection:</InputLabel>
          <Select
            native
            value={filterType}
            onChange={this.handleSelectChange}
            inputProps={{
              id: 'select-collection',
            }}
            style={{ minWidth: '15ch' }}
          >
            <option aria-label="None" value="" />
            {
              Object.keys(collectionObjects).map((name, index) => (
                <option key={index} value={name}>{name}</option>
              ))
            }
          </Select>
        </FormControl>
        <hr />
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {
          filterType ? 
            collectionObjects[filterType] : Object.values(collectionObjects)
        }
        </div>
      </>
    )
  }
}

export default ObjectsTab;
