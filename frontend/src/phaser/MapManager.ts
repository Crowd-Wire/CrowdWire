import { GameObjects, Scene, Tilemaps, Physics } from "phaser";
import { API_BASE } from "config";

import useWorldUserStore from "stores/useWorldUserStore";
import { Collections } from "@material-ui/icons";


enum MapManagerState {
    LOADED = "LOADED",
    BUILT = "BUILT",
}


class MapManager {
    static _instance: MapManager;

    private map: Tilemaps.Tilemap;
    private mapJson: any;
    private state: MapManagerState;
    private worldId: number;

    private tileKeys: number[];
    private objectKeys: number[];

    private objectProps: any;


    constructor() {
        if (!MapManager._instance) {
            const worldUser = useWorldUserStore.getState().world_user;
            this.worldId = worldUser.world_id;
            this.mapJson = JSON.parse(worldUser.world_map);
            MapManager._instance = this;
        }
        return MapManager._instance;
    }

    loadMap(scene: Scene): void {
        scene.load.tilemapTiledJSON('map', this.mapJson);

        this.tileKeys = [];
        this.objectKeys = [];
        this.objectProps = {};
        this.mapJson.tilesets.forEach((tileset) => {
            if ('grid' in tileset) {
                // object layer
                tileset.tiles.forEach((tile) => {
                    const tilesetName = tile.image;
                    scene.load.image(tilesetName.toString(), API_BASE + "static/maps/" + tile.image);
                    this.objectKeys.push(tilesetName);
                    if ('objectgroup' in tile) {
                        // custom object collider
                        const {x, y, width, height} = tile.objectgroup.objects[0];
                        this.objectProps[tilesetName] = {x, y, width, height} as Phaser.Geom.Rectangle;
                    }
                })
            } else {
                // tile layer
                const tilesetName = tileset.name;
                scene.load.image(tilesetName, API_BASE + "static/maps/" + tileset.image);
                this.tileKeys.push(tilesetName);
            }
        })
        this.state = MapManagerState.LOADED;
    }

    buildMap(scene: Scene): Tilemaps.Tilemap {
        if (this.state !== MapManagerState.LOADED)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        this.map = scene.add.tilemap('map');

        // add tileset images
        const tilesets: Tilemaps.Tileset[] = []
        this.tileKeys.forEach((key) => {
            tilesets.push( this.map.addTilesetImage(key.toString()) );
        })
        this.objectKeys.forEach((key) => {
            this.map.addTilesetImage(key.toString());
        });

        // create tile layers with tileset images
        this.map.layers.forEach((layer) => {
            this.map.createLayer(layer.name, tilesets);
        })

        this.state = MapManagerState.BUILT;
        

        return this.map;
    }

    buildObjects(scene: Scene): Physics.Arcade.StaticGroup {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        const images = this.map.imageCollections.map((c) => {
                return c.images.map((i) => {
                    let image = {...i};
                    delete Object.assign(image, {key: image.image }).image;
                    return image;
                })
            })
            .reduce((acc, val) => acc.concat(val), []);

        console.log(images, this.map.imageCollections)

        const collisionObjects = this.map.createFromObjects('ObjectCollision', images)
        const objects = this.map.createFromObjects('Object', images);

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
                    body.setOffset(x, y).setSize(width, height, false);
                    obj.setDepth(body.y);
                }
            })
        console.log(this.map)
        return collisionObjectsGroup;
    }

    saveMap(): void {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);
    }
}

export default MapManager;
