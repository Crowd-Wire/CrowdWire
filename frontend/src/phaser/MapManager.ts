import { GameObjects, Scene, Tilemaps, Physics, Geom } from "phaser";
import { API_BASE } from "config";

import WorldService from "services/WorldService";
import useWorldUserStore from "stores/useWorldUserStore";
import WallManager from "./WallManager";
import useWorldEditorStore from "stores/useWorldEditorStore";


enum MapManagerState {
    LOADED = "LOADED",
    BUILT = "BUILT",
}

interface TileLayerProps {
    image: string,
    properties?: Record<string, any>;
}

interface ObjectProps {
    gid: number;
    body?: Geom.Rectangle;
    properties?: Record<string, any>;
}


class MapManager {
    static _instance: MapManager;

    private mapJson: any;
    private state: MapManagerState;
    private worldId: number;
    private conferenceMap: Record<number, string>;

    public map: Tilemaps.Tilemap;
    public tilesetProps: Record<string, TileLayerProps>;
    public objectProps: Record<string, ObjectProps>;
    public objectGroups: Record<string, Physics.Arcade.Group | Physics.Arcade.StaticGroup>;

    constructor(refresh: boolean=false) {
        if (!MapManager._instance || refresh) {
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

        this.tilesetProps = {};
        this.objectProps = {};
        this.mapJson.tilesets.forEach((tileset) => {
            if ('grid' in tileset) {
                // Object layer
                tileset.tiles.forEach((tile) => {
                    const name = tile.image;
                    scene.load.image(name, API_BASE + "static/maps/" + tile.image);
                    this.objectProps[name] = { gid: tileset.firstgid + tile.id };
                    if ('objectgroup' in tile) {
                        // Custom object collider
                        const { x, y, width, height } = tile.objectgroup.objects[0];
                        this.objectProps[name].body = { x, y, width, height } as Geom.Rectangle;
                    }
                    if ('properties' in tile) {
                        const props = {};
                        tile.properties.forEach(({ name, type, value }) => {
                            props[name] = (type === 'int') ? parseInt(value, 10) : value;
                        });
                        this.objectProps[name].properties = props;
                    }
                })
            } else {
                // Tile layer
                const { name, image, properties } = tileset;
                scene.load.spritesheet(name, API_BASE + "static/maps/" + image, { frameWidth: 32, frameHeight: 32 });
                this.tilesetProps[name] = { image };
                if (properties) {
                    const props = {};
                    properties.forEach(({ name, type, value }) => {
                        props[name] = (type === 'int') ? parseInt(value, 10) : value;
                    });
                    this.tilesetProps[name].properties = props;
                }
            }
        })
        this.state = MapManagerState.LOADED;
    }

    buildMap(scene: Scene): Tilemaps.Tilemap {
        if (this.state !== MapManagerState.LOADED)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        this.map = scene.add.tilemap('map');

        // Add tileset images
        const tilesets: Tilemaps.Tileset[] = [];
        Object.keys(this.tilesetProps).forEach((key) => {
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
                const { body, properties } = this.objectProps[obj.texture.key]
                if (body) {
                    // has custom collider
                    const { x, y, width, height } = body;
                    const objBody = obj.body as Phaser.Physics.Arcade.Body;
                    objBody.setOffset(x, y).setSize(width, height, false);
                    obj.setDepth(objBody.y);
                } else {
                    obj.setDepth(obj.y);
                }
                if (properties) {
                    obj.setData(properties);
                }
            })
        this.objectGroups = { 'Object': group, 'ObjectCollision': collisionGroup };

        return this.objectGroups;
    }

    /**
     * Create a new tileset to represent the new conference tiles
     */
    addConference(cid: string, properties?: any): void {
        // Create tileset
        const id = 100000 + parseInt(cid.substr(1), 10),
            name = `__CONFERENCE_${cid}`;
        const newTileset = new Tilemaps.Tileset(name, id, 32, 32, 0, 0);
        newTileset.setImage(this.map.scene.textures.get('__CONFERENCE'));
        newTileset.tileProperties = { 0: { conference: cid } };

        this.tilesetProps[name] = {
            image: "tilesets/conference.png",
            properties: properties || {},
        }

        // Add tileset to map
        this.map.tilesets.push(newTileset);

        // Add tileset to conference layer
        const tilesets = this.map.getLayer('__Conference').tilemapLayer.tileset.concat(newTileset);
        (<any>this.map.getLayer('__Conference').tilemapLayer).setTilesets(tilesets);
    }

    getConferenceGid(cid: string): number {
        if (this.conferenceMap[cid])
            return this.conferenceMap[cid];

        for (const tileset of this.map.getLayer('__Conference').tilemapLayer.tileset) {
            if (tileset.name.startsWith('__CONFERENCE_') && tileset.name.includes(cid)) {
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
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        // Remove tileset from map
        let arr = this.map.tilesets;
        for (let i = 0; i < arr.length; i++) {
            const tileset = arr[i];

            if (tileset.name.startsWith('__CONFERENCE_') && tileset.name.includes(cid)) {
                arr.splice(i, 1);
                break;
            }
        }
        const conferenceLayer = this.map.getLayer('__Conference').tilemapLayer;

        // Remove tiles of tileset from conference layer
        const findIndex = this.getConferenceGid(cid);
        if (findIndex)
            conferenceLayer.replaceByIndex(findIndex, -1, 0, 0, conferenceLayer.width, conferenceLayer.height);

        // Remove tileset conference layer
        arr = conferenceLayer.tileset;
        for (let i = 0; i < arr.length; i++) {
            const tileset = arr[i];

            if (tileset.name.startsWith('__CONFERENCE_') && tileset.name.includes(cid)) {
                arr.splice(i, 1);
                break;
            }
        }
        (<any>conferenceLayer).setTilesets(conferenceLayer.tileset);
    }

    resizeMap(width: number, height: number): void {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        const wallManager = new WallManager(
            this.map.getLayer('__Collision'),
            this.map.getLayer('__Float')
        );

        for (const layer of this.map.layers) {
            // Apply offset to layer
            
            // if (offsetX > 0) {
            //     layer.tilemapLayer.forEachTile((tile) => {

            //     })
            //     for (let y = 0; y < height; y++) {
            //         layer.data.push(Array.from(
            //             Array(height - this.map.height), 
            //             (_, x) => new Tilemaps.Tile(layer, -1, x, y, 32, 32, 32, 32)));
            //     }
            // }

            // console.log(layer)
            // layer.tilemapLayer.copy(0, 0, 10, 10, 1, 1);
            // layer.tilemapLayer.copy(0, 0, this.map.width, this.map.height, -offsetX, -offsetY);
            // layer.tilemapLayer.fill(-1, (this.map.width - offsetX) % this.map.width, 0, Math.abs(offsetX), this.map.height);
            // layer.tilemapLayer.fill(-1, 0, (this.map.height - offsetY) % this.map.height, this.map.width, Math.abs(offsetY));
            
            // Apply size to layer
            if (this.map.height > height) {
                layer.data.splice(height);
                for (let y = height; y < this.map.height; y++) {
                    wallManager.removeLine(y);
                }
            } else if (this.map.height < height) {
                for (let y = this.map.height; y < height; y++) {
                    layer.data.push(Array.from(
                        Array(this.map.width), 
                        (_, x) => new Tilemaps.Tile(layer, -1, x, y, 32, 32, 32, 32)));
                }
            }
            if (this.map.width > width) {
                for (let y = 0; y < height; y++) {
                    layer.data[y].splice(width);
                }
                for (let x = width; x < this.map.width; x++) {
                    wallManager.removeColumn(x);
                }
            } else if (this.map.width < width) {
                for (let y = 0; y < height; y++) {
                    layer.data[y].push(...Array.from(
                        Array(width - this.map.width), 
                        (_, x) => new Tilemaps.Tile(layer, -1, x + this.map.width, y, 32, 32, 32, 32)));
                }
            }
            layer.width = width;
            layer.height = height;
        }
        for (const group of Object.values(this.objectGroups)) {
            // Apply offset to objects
            // for (const obj of group.children.entries) {
            //     const sprite = obj as GameObjects.Sprite,
            //         body = obj.body as Phaser.Physics.Arcade.Body,
            //         newX = body.x - 32*offsetX,
            //         newY = body.y - 32*offsetY;
            //     if (newX < 0 || 32*width < newX + body.width
            //         || newY < 0 || 32*height < newY + body.height) {
            //         // Out of world bounds
            //         obj.destroy();
            //     } else {
            //         // Apply offset
            //         sprite.setPosition(sprite.x - 32*offsetX, sprite.y - 32*offsetY);
            //     }
            // }
            // Remove objects out of bounds
            for (const obj of group.children.entries) {
                const body = obj.body as Phaser.Physics.Arcade.Body;
                if (body.x < 0 || 32*width < body.x + body.width
                    || body.y < 0 || 32*height < body.y + body.height) {
                    // Out of world bounds
                    body.gameObject.destroy();
                }
            }
        }
        // Apply size to map
        this.map.width = width;
        this.map.height = height;
        this.map.widthInPixels = width*32;
        this.map.heightInPixels = height*32;

        useWorldEditorStore.getState().setState({ save: true, resized: true });
    }

    saveMap(): Promise<Response> {
        if (this.state !== MapManagerState.BUILT)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        const saveJson = JSON.stringify(new MapParser(this).toJson());
        return WorldService.putWorld(this.worldId, { worldMap: saveJson });
    }
}


class MapParser {
    private map: Tilemaps.Tilemap;
    private tilesetProps: Record<string, TileLayerProps>;
    private objectProps: Record<string, ObjectProps>;
    private objectGroups: Record<string, Physics.Arcade.Group | Physics.Arcade.StaticGroup>;

    constructor(mapManager: MapManager) {
        this.map = mapManager.map;
        this.tilesetProps = mapManager.tilesetProps;
        this.objectProps = mapManager.objectProps;
        this.objectGroups = mapManager.objectGroups;
    }

    private tileLayerToJson(id: number, layer: Tilemaps.LayerData) {
        const { name, height, width } = layer,
            data = layer.data.flat().map((tile) => tile.index > 0 ? tile.index : 0),
            properties = layer.properties.length > 0 ? layer.properties : undefined;
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
                const { name, x, y, height, width, angle, data, texture } = obj as GameObjects.Sprite,
                    properties = data ? Object.entries(data.list).map(([name, value]) => (
                        { name, type: typeof value === 'number' ? 'int' : typeof value, value })) : undefined,
                    gid = this.objectProps[texture.key].gid;
                return {
                    gid,
                    height,
                    // id,
                    name,
                    properties,
                    rotation: angle,
                    type: '',
                    visible: true,
                    width,
                    x: x - width / 2,
                    y: y + height / 2,
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
                let { body, properties } = this.objectProps[obj.image] || {},
                    { width, height } = this.map.scene.textures.get(obj.image).frames['__BASE'];
                if (body) {
                    const { x, y, width, height } = body;
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
                if (properties) {
                    properties = Object.entries(properties).map(([name, value]) => (
                        { name, type: typeof value === 'number' ? 'int' : typeof value, value }
                    ));
                }
                return {
                    id: obj.gid - firstgid,
                    image: obj.image,
                    objectgroup,
                    imageheight: height,
                    imagewidth: width,
                    properties,
                    // type
                }
            })
        return {
            columns: 0,
            firstgid,
            grid: { height: 1, orientation: "orthogonal", width: 1 },
            margin: 0,
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
            image = this.tilesetProps[name].image,
            { width, height } = tileset.image.frames['__BASE'],
            tiles = Object.entries(tileProperties).map(([id, props]) => {
                const properties = Object.entries(props).map(([name, value]) => (
                    { name, type: typeof value === 'number' ? 'int' : typeof value, value }
                ))
                return { id, properties };
            });
        let properties = this.tilesetProps[name].properties;
        if (properties) {
            properties = Object.entries(properties).map(([name, value]) => (
                { name, type: typeof value === 'number' ? 'int' : typeof value, value }));
        }
        return {
            columns,
            firstgid,
            image,
            imageheight: height,
            imagewidth: width,
            margin: tileMargin,
            name,
            properties,
            spacing: tileSpacing,
            tilecount: total,
            tileheight: tileHeight,
            tiles: tiles.length > 0 ? tiles : undefined,
            tilewidth: tileWidth,
            transparentcolor: '#ff0000'
        }
    }

    private tilesetsToJson() {
        const { tilesets, imageCollections } = this.map;
        const tilesetImages: any[] = tilesets.filter((tileset) => tileset.name in this.tilesetProps)
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
            // nextlayerid,
            // nextobjectid,
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
