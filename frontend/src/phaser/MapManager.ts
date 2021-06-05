import { GameObjects, Scene, Tilemaps, Physics, Geom } from "phaser";
import { API_BASE } from "config";

import useWorldUserStore from "stores/useWorldUserStore";


enum MapManagerState {
    LOADED = "LOADED",
    BUILT = "BUILT",
}


class MapManager {
    static _instance: MapManager;

    private mapJson: any;
    private state: MapManagerState;
    private worldId: number;
    private conferenceMap: Record<number, string>;

    public tilesetKeys: string[];
    public objectKeys: string[];
    public tilesetURL: Record<string, string>;
    public objectBody: Record<string, Geom.Rectangle>;
    public map: Tilemaps.Tilemap;

    constructor() {
        if (!MapManager._instance) {
            const worldUser = useWorldUserStore.getState().world_user;
            this.worldId = worldUser.world_id;
            this.mapJson = JSON.parse(worldUser.world_map);
            this.conferenceMap = {};
            MapManager._instance = this;
        }
        return MapManager._instance;
    }

    loadMap(scene: Scene): void {
        scene.load.tilemapTiledJSON('map', this.mapJson);

        this.tilesetKeys = [];
        this.objectKeys = [];
        this.tilesetURL = {};
        this.objectBody = {};
        this.mapJson.tilesets.forEach((tileset) => {
            if ('grid' in tileset) {
                // object layer
                tileset.tiles.forEach((tile) => {
                    const tilesetName = tile.image;
                    scene.load.image(tilesetName, API_BASE + "static/maps/" + tile.image);
                    this.objectKeys.push(tilesetName);
                    if ('objectgroup' in tile) {
                        // custom object collider
                        const { x, y, width, height } = tile.objectgroup.objects[0];
                        this.objectBody[tilesetName] = { x, y, width, height } as Geom.Rectangle;
                    }
                })
            } else {
                // tile layer
                const tilesetName = tileset.name;
                scene.load.spritesheet(tilesetName, API_BASE + "static/maps/" + tileset.image, { frameWidth: 32, frameHeight: 32 });
                this.tilesetKeys.push(tilesetName);
                this.tilesetURL[tilesetName] = tileset.image;
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
        this.tilesetKeys.forEach((key) => {
            tilesets.push(this.map.addTilesetImage(key));
        });
        this.objectKeys.forEach((key) => {
            this.map.addTilesetImage(key);
        });

        // create tile layers with tileset images
        this.map.layers.forEach((layer) => {
            this.map.createLayer(layer.name, tilesets);
        })

        this.state = MapManagerState.BUILT;
        return this.map;
    }

    buildObjects(scene: Scene): Record<string, Physics.Arcade.Group | Physics.Arcade.StaticGroup> {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        const images = this.map.imageCollections.map((c) => {
            return c.images.map((i) => ({ gid: i.gid, key: i.image }));
        })
            .reduce((acc, val) => acc.concat(val), []);

        const collisionObjects = this.map.createFromObjects('ObjectCollision', images)
        const objects = this.map.createFromObjects('Object', images);

        // Create a sprite group for all objects, set common properties to ensure that
        // sprites in the group don't move via gravity or by player collisions
        const collisionGroup = scene.physics.add.staticGroup(
            collisionObjects,
        );

        const group = scene.physics.add.group(
            objects,
        );

        (<GameObjects.Sprite[]>collisionGroup.getChildren().concat(group.getChildren()))
            .forEach((obj) => {
                if (obj.texture.key in this.objectBody) {
                    // has custom collider
                    const { x, y, width, height } = this.objectBody[obj.texture.key];
                    const body = obj.body as Phaser.Physics.Arcade.Body;
                    body.setOffset(x, y).setSize(width, height, false);
                    obj.setDepth(body.y);
                }
            })
        console.log(this.map)
        return { 'Object': group, 'ObjectCollision': collisionGroup };
    }

    /**
     * Create a new tileset to represent the new conference tiles
     */
    addConference(cid: string): void {
        // Create tileset
        const id: number = parseInt(cid.substr(1), 10);
        const newTileset = new Tilemaps.Tileset(`_conference${cid}`, 100000 + id, 32, 32, 0, 0);
        newTileset.setImage(this.map.scene.textures.get('_conference'))

        // Add tileset to map
        this.map.tilesets.push(newTileset);

        // Add tileset to conference layer
        const tilesets = this.map.getLayer('Room').tilemapLayer.tileset.concat(newTileset);
        (<any>this.map.getLayer('Room').tilemapLayer).setTilesets(tilesets);
    }

    getConferenceGid(cid: string): number {
        if (this.conferenceMap[cid])
            return this.conferenceMap[cid];

        for (const tileset of this.map.getLayer('Room').tilemapLayer.tileset) {
            if (tileset.name.startsWith("_conference") && tileset.name.includes(cid)) {
                this.conferenceMap[cid] = tileset.firstgid;
                return tileset.firstgid;
            }
        }
        return null;
    }

    getConferenceCid(gid: number): string {
        return Object.keys(this.conferenceMap).find(cid => this.conferenceMap[cid] === gid);
    }

    removeConference(cid: string): void {
        // Remove tileset from map
        let arr = this.map.tilesets;
        for (let i = 0; i < arr.length; i++) {
            const tileset = arr[i];

            if (tileset.name.startsWith("_conference") && tileset.name.includes(cid)) {
                arr.splice(i, 1);
                break;
            }
        }
        const conferenceLayer = this.map.getLayer('Room').tilemapLayer;

        // Remove tiles of tileset from conference layer
        const findIndex = this.getConferenceGid(cid);
        if (findIndex)
            conferenceLayer.replaceByIndex(findIndex, -1, 0, 0, conferenceLayer.width, conferenceLayer.height);

        // Remove tileset conference layer
        arr = conferenceLayer.tileset;
        for (let i = 0; i < arr.length; i++) {
            const tileset = arr[i];

            if (tileset.name.startsWith("_conference") && tileset.name.includes(cid)) {
                arr.splice(i, 1);
                break;
            }
        }
        (<any>conferenceLayer).setTilesets(conferenceLayer.tileset);
    }

    async saveMap(): Promise<void> {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        console.log('Save', this.worldId)
    }
}

export default MapManager;
