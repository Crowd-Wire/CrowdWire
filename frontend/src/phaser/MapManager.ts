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

    private objectProps: any;

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
        this.objectProps = {};
        this.mapJson.tilesets.forEach((tileset) => {
            if ('grid' in tileset) {
                // object layer
                tileset.tiles.forEach((tile) => {
                    const imageId = tileset.firstgid + tile.id;
                    scene.load.image(imageId.toString(), API_BASE + "static/" + tile.image);
                    this.objectKeys.push(imageId);
                    if ('objectgroup' in tile) {
                        // custom object collider
                        const {x, y, width, height} = tile.objectgroup.objects[0];
                        this.objectProps[imageId] = {x, y, width, height} as Phaser.Geom.Rectangle;
                    }
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

    buildMap(scene: Scene): Tilemaps.Tilemap {
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
        return this.map;
    }

    buildObjects(scene: Scene): GameObjects.GameObject[] {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        const collisionObjects = this.map.createFromObjects('ObjectCollision', this.objectKeys.map((key) => (
            {gid: key, key: key.toString()}
        )));
        const objects = this.map.createFromObjects('Object', this.objectKeys.map((key) => (
            {gid: key, key: key.toString()}
        )));

        // Create a sprite group for all objects, set common properties to ensure that
        // sprites in the group don't move via gravity or by player collisions
        const collisionObjectsGroup = scene.physics.add.staticGroup(
            collisionObjects,
        );

        const objectsGroup = scene.physics.add.group(
            objects,
        );

        (<GameObjects.Sprite[]> collisionObjectsGroup.getChildren().concat(objectsGroup.getChildren()))
            .forEach((obj) => {
                if (obj.texture.key in this.objectProps) {
                    // has custom collider
                    const {x, y, width, height} = this.objectProps[obj.texture.key];
                    const body = obj.body as Phaser.Physics.Arcade.Body;
                    body.setOffset(x, y);
                    body.setSize(width, height, false);
                }
            })
        return collisionObjects;
    }

    saveMap(): void {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);
    }
}

export default MapManager;
