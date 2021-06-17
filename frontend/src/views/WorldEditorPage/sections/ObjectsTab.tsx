import React, { Component } from "react";

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CategoryTwoToneIcon from '@material-ui/icons/CategoryTwoTone';

import TabHeader, { TabSelect } from './TabHeader';
import MapManager from "phaser/MapManager";
import useWorldEditorStore, { ToolType } from "stores/useWorldEditorStore";

import { API_BASE } from "config";


interface ObjectsTabState {
  filterType: string;
  filterCollection: string;
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
      filterCollection: '',
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
    collectionObjects['Interactables'] = [];
    collectionObjects['Collisibles'] = [];
    collectionObjects['On Wall'] = [];
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
          useWorldEditorStore.getState().addTile(image, { style });

          const objElement = (
            <div
              key={gid}
              onClick={() => this.handleClick(image)}
              style={{
                width: 32,
                height: 32,
                ...style,
                ...objectStyle,
              }}
            ></div>
          );
          objects.push(objElement);
          const props = mapManager.objectProps[image]?.properties;
          if (props) {
            if (props.onWall)
              collectionObjects['On Wall'].push(objElement);
            if (props.collides)
              collectionObjects['Collisibles'].push(objElement);              
            if (props.interact)
              collectionObjects['Interactables'].push(objElement);
          }             
        }
        collectionObjects[collection.name] = objects;
      }
    }
    this.setState({ collectionObjects });
  }

  handleSelectChange = (event: React.ChangeEvent<{ value: string }>) => {
    this.setState({ filterCollection: event.target.value });
  }

  handleSelectChange2 = (event: React.ChangeEvent<{ value: string }>) => {
    this.setState({ filterType: event.target.value });
  }

  handleClick = (id: string) => {
    useWorldEditorStore.getState().setTool({ type: ToolType.DRAW });
    useWorldEditorStore.setState({ activeLayer: 'Object Layer' });
    useWorldEditorStore.setState(state => {
      const layers = state.layers;
      for (const name of Object.keys(layers))
        layers[name].active = ['Object', 'ObjectCollision'].includes(name);
      return { layers };
    });
    useWorldEditorStore.getState().setActive('object', id);
  }

  render() {
    const { filterType, filterCollection, collectionObjects } = this.state;
    const typeOptions = ['On Wall', 'Collisibles', 'Interactables'];

    return (
      <>
        <TabHeader names={['Object', 'ObjectCollision']} Icon={CategoryTwoToneIcon}>
          <TabSelect placeholder="Collection" value={filterCollection} options={Object.keys(collectionObjects).filter((n) => !typeOptions.includes(n))} handle={this.handleSelectChange} />
          <TabSelect placeholder="Type" value={filterType} options={typeOptions} handle={this.handleSelectChange2} />
        </TabHeader>

        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {
          filterType && filterCollection ? new Set([...collectionObjects[filterType], ...collectionObjects[filterCollection]]) :
          filterType ? collectionObjects[filterType] :
          filterCollection ? collectionObjects[filterCollection] :
          Object.values(collectionObjects)
        }
        </div>
      </>
    )
  }
}

export default ObjectsTab;
