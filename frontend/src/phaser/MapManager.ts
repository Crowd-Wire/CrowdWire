import { GameObjects, Scene, Tilemaps, Physics, Geom } from "phaser";
import { API_BASE } from "config";

import useWorldUserStore from "stores/useWorldUserStore";


enum MapManagerState {
    LOADED = "LOADED",
    BUILT = "BUILT",
}


interface TileLayerProps {
    image: string,
}

interface ObjectProps {
    body?: Geom.Rectangle,
}

class MapManager {
    static _instance: MapManager;

    private mapJson: any;
    private state: MapManagerState;
    private worldId: number;
    private conferenceMap: Record<number, string>;

    public map: Tilemaps.Tilemap;
    public tileLayerProps: Record<string, TileLayerProps>;
    public objectProps: Record<string, ObjectProps>;
    public objectGroups: Record<string, Physics.Arcade.Group | Physics.Arcade.StaticGroup>;

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

        this.tileLayerProps = {};
        this.objectProps = {};
        this.mapJson.tilesets.forEach((tileset) => {
            if ('grid' in tileset) {
                // Object layer
                tileset.tiles.forEach((tile) => {
                    const name = tile.image;
                    scene.load.image(name, API_BASE + "static/maps/" + tile.image);
                    this.objectProps[name] = {};
                    if ('objectgroup' in tile) {
                        // Custom object collider
                        const { x, y, width, height } = tile.objectgroup.objects[0];
                        this.objectProps[name].body = { x, y, width, height } as Geom.Rectangle;
                    }
                })
            } else {
                // Tile layer
                const { name, image } = tileset;
                scene.load.spritesheet(name, API_BASE + "static/maps/" + image, { frameWidth: 32, frameHeight: 32 });
                this.tileLayerProps[name] = { image };
            }
        })
        this.state = MapManagerState.LOADED;
    }

    buildMap(scene: Scene): Tilemaps.Tilemap {
        if (this.state !== MapManagerState.LOADED)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        this.map = scene.add.tilemap('map');

        // Add tileset images
        const tilesets: Tilemaps.Tileset[] = []
        Object.keys(this.tileLayerProps).forEach((key) => {
            tilesets.push(this.map.addTilesetImage(key));
        });
        Object.keys(this.objectProps).forEach((key) => {
            this.map.addTilesetImage(key);
        });

        // Create tile layers with tileset images
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
        ).setName('ObjectCollision');

        const group = scene.physics.add.group(
            objects,
        ).setName('Object');

        (<GameObjects.Sprite[]>collisionGroup.getChildren().concat(group.getChildren()))
            .forEach((obj) => {
                const rec = this.objectProps[obj.texture.key]?.body
                if (rec) {
                    // has custom collider
                    const { x, y, width, height } = rec;
                    const body = obj.body as Phaser.Physics.Arcade.Body;
                    body.setOffset(x, y).setSize(width, height, false);
                    obj.setDepth(body.y);
                }
            })
        console.log(this.map)
        this.objectGroups = { 'Object': group, 'ObjectCollision': collisionGroup };

        console.log(this.objectGroups)
        return this.objectGroups;
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

        console.log(new MapParser(this).toJson());

    }


}


class MapParser {
    private map: Tilemaps.Tilemap;
    private tileLayerProps: Record<string, TileLayerProps>;
    private objectProps: Record<string, ObjectProps>;
    private objectGroups: Record<string, Physics.Arcade.Group | Physics.Arcade.StaticGroup>;

    constructor(mapManager: MapManager) {
        this.map = mapManager.map;
        this.tileLayerProps = mapManager.tileLayerProps;
        this.objectProps = mapManager.objectProps;
        this.objectGroups = mapManager.objectGroups;
    }

    private tileLayerToJson(id: number, layer: Tilemaps.LayerData) {
        const { name, height, width, properties } = layer,
            data = layer.data.flat().map((tile) => tile.index > 0 ? tile.index : 0)
        return {
            data,
            height,
            id,
            name,
            opacity: 1,
            properties,
            type: 'tilelayer',
            visible: true,
            width,
            x: 0,
            y: 0,
        }
    }

    private objectLayerToJson(id: number, layer: Tilemaps.ObjectLayer) {
        const { name, properties } = layer,
            objects = this.objectGroups[name].children.entries.map((obj, index) => {
                const { name, x, y, height, width, angle, data } = obj as GameObjects.Sprite,
                    properties = Object.entries(data.list).map(([name, value]) =>
                        ({ name, type: typeof value, value }));
                return {
                    gid: id + index,
                    height,
                    id: 21,
                    name,
                    properties,
                    rotation: angle,
                    type: '',
                    visible: true,
                    width,
                    x,
                    y,
                }
            });
        return {
            draworder: 'topdown',
            id,
            name,
            objects,
            opacity: 1,
            properties,
            type: 'objectgroup',
            visible: true,
            x: 0,
            y: 0,
        }
    }

    private layersToJson(): any[] {
        const { layers, objects } = this.map;
        let id = 1;
        const tileLayers: any[] = layers.map((layer) => this.tileLayerToJson(id++, layer));
        const objectLayers: any[] = objects.map((layer) => this.objectLayerToJson(id++, layer));
        return tileLayers.concat(objectLayers);
    }

    private collectionImageToJson(collection: Tilemaps.ImageCollection) {
        const { firstgid, name, imageHeight, imageSpacing, imageWidth, total } = collection,
            tiles = collection.images.map((obj) => {
                let objectgroup;
                const rec = this.objectProps['name']?.body;
                if (rec) {
                    const { x, y, width, height } = rec;
                    objectgroup = {
                        draworder: 'index',
                        name: '',
                        objects: [
                            {
                                height,
                                id: 2,
                                name: '',
                                rotation: 0,
                                type: '',
                                visible: true,
                                width,
                                x,
                                y,
                            }],
                        opacity: 1,
                        type: 'objectgroup',
                        visible: true,
                        x: 0,
                        y: 0,
                    }
                }
                return {
                    id: obj.gid - firstgid,
                    image: obj.image,
                    objectgroup,
                    // imageheight,
                    // imagewidth,
                    properties: [],
                    type: ''
                }
            })
        return {
            // columns,
            firstgid,
            grid: { height: 1, orientation: "orthogonal", width: 1 },
            // margin,
            name,
            spacing: imageSpacing,
            tilecount: total,
            tileheight: imageHeight,
            tiles,
            tilewidth: imageWidth,
        }
    }

    private tilesetImageToJson(tileset: Tilemaps.Tileset) {
        const { columns, firstgid, name, tileHeight, tileWidth,
            tileMargin, tileSpacing, tileProperties, total } = tileset,
            image = this.tileLayerProps['name'].image,
            tiles = Object.entries(tileProperties).map(([name, value], id) =>
                ({ id, properties: { name, type: typeof value, value } }));
        return {
            columns,
            firstgid,
            image,
            // imageheight,
            // imagewidth,
            margin: tileMargin,
            name,
            properties: [],
            spacing: tileSpacing,
            tilecount: total,
            tileheight: tileHeight,
            tiles,
            tilewidth: tileWidth,
            transparentcolor: '#ff0000'
        }
    }

    private tilesetsToJson() {
        const { tilesets, imageCollections } = this.map;
        const tilesetImages: any[] = tilesets.filter((tileset) => tileset.name in this.tileLayerProps)
            .map((tileset) => this.tilesetImageToJson(tileset));
        const collectionImages: any[] = imageCollections
            .map((collection) => this.collectionImageToJson(collection));
        return tilesetImages.concat(collectionImages);
    }

    toJson(): any {
        const { width, height, tileWidth, tileHeight, properties, renderOrder } = this.map;
        return {
            compressionlevel: -1,
            height,
            infinite: false,
            layers: this.layersToJson(),
            nextlayerid: 8,
            nextobjectid: 24,
            orientation: "orthogonal",
            properties,
            renderorder: renderOrder,
            tiledversion: "1.4.2",
            tileheight: tileHeight,
            tilesets: this.tilesetsToJson(),
            tilewidth: tileWidth,
            type: "map",
            version: 1.4,
            width,
        }
    }

}

export default MapManager;
