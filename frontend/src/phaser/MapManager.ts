import WorldService from "services/WorldService.js";

import exampleJson from "assets/tilemaps/maps/test.json";

import { API_BASE } from "config";
import { GameObjects, Scene, Tilemaps } from "phaser";

const wallTiles = require("assets/tilemaps/tiles/wall-tiles.png");

enum MapManagerState {
    FETCHED = "FETCHED",
    LOADED = "LOADED",
    BUILT = "BUILT",
}

// interface Layers {
//     floatLayers: Tilemaps.TilemapLayer[];
//     groundLayers: Tilemaps.TilemapLayer[];
//     collisionLayer: Tilemaps.TilemapLayer;
//     roomLayer: Tilemaps.TilemapLayer;
// }

class MapManager {
    // private layers: Layers;
    private map: Tilemaps.Tilemap;
    private mapJson: any;
    private state: MapManagerState;
    private worldId: string;

    private tileKeys: number[];
    private objectKeys: number[];

    constructor(worldId: string) {
        this.worldId = worldId;
    }

    async fetchMap(): Promise<void> {
        await WorldService.getWorldDetails(this.worldId)
            .then((res) => {
                return res.json();
            }).then((res) => {
                this.mapJson = JSON.parse(res.world_map);
                this.state = MapManagerState.FETCHED;
            })
    }

    loadMap(scene: Scene): void {
        if (this.state !== MapManagerState.FETCHED)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        // map in json format
        // scene.load.tilemapTiledJSON('map', API_BASE + "static/default_map.json");
        scene.load.tilemapTiledJSON('map', this.mapJson);

        console.log(this.mapJson)

        this.tileKeys = [];
        this.objectKeys = [];
        this.mapJson.tilesets.forEach((tileset) => {
            if ('grid' in tileset) {
                // object layer
                tileset.tiles.forEach((tile) => {
                    const imageId = tileset.firstgid + tile.id;
                    scene.load.image(imageId.toString(), API_BASE + "static/" + tile.image);
                    this.objectKeys.push(imageId);
                })
            } else {
                // tile layer
                const imageId = tileset.name;
                scene.load.image(imageId, API_BASE + "static/" + tileset.image);
                this.tileKeys.push(imageId);
            }
        })

        this.state = MapManagerState.LOADED;
        console.log("LOADING COMPLETED")
    }

    buildMap(scene: Scene): void {
        if (this.state !== MapManagerState.LOADED)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        this.map = scene.add.tilemap('map');

        // add tileset images
        const tilesetImages: Tilemaps.Tileset[] = []
        this.tileKeys.forEach((key) => {
            tilesetImages.push( this.map.addTilesetImage(key.toString()) );
        })
        this.objectKeys.forEach((key) => {
            this.map.addTilesetImage(key.toString());
        });

        // create tile layers with tileset images
        this.map.layers.forEach((layer) => {
            this.map.createLayer(layer.name, tilesetImages);
        })

        this.state = MapManagerState.BUILT;
    }

    saveMap(): void {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);
    }

    getTilemap(): Tilemaps.Tilemap {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);
        return this.map;
    }

    getObjects(): GameObjects.GameObject[] {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);
        return this.map.createFromObjects('Object', this.objectKeys.map((key) => (
            {gid: key, key: key.toString()}
        )));
    }
}

export default MapManager;
