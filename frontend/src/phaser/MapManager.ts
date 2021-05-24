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

        // map tiles
        scene.load.image('wall-tiles', wallTiles);
        scene.load.image('util-tiles',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/util-tiles.png`);
        scene.load.image('table-tiles',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-tiles.png`);
        scene.load.image('table-V',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-V.png`);
        scene.load.image('table-H',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-H.png`);
        scene.load.image('jardim',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/jardim.png`);
        scene.load.image('deti',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/wooden-plank.png`);
        scene.load.image('arrow',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/arrow.png`);
        scene.load.image('board',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/board.png`);
        scene.load.image('bricks',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/bricks.png`);
        scene.load.image('chair',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/chair.png`);

        this.state = MapManagerState.LOADED;
        console.log("LOADING COMPLETED")
    }

    buildMap(scene: Scene): void {
        if (this.state !== MapManagerState.LOADED)
            throw Error(`Illegal call to function with the current state ${this.state}`);

        this.map = scene.add.tilemap('map');

        const tilesetImages: Tilemaps.Tileset[] = []
        this.tileKeys.forEach((key) => {
            tilesetImages.push( this.map.addTilesetImage(key.toString()) );
        })
        this.objectKeys.forEach((key) => {
            this.map.addTilesetImage(key.toString());
        });

        const wallTileset = this.map.addTilesetImage('wall-tiles');
        const utilTileset = this.map.addTilesetImage('util-tiles');
        const tableTileset = this.map.addTilesetImage('table-tiles');
        const jardimTileset = this.map.addTilesetImage('jardim');
        const arrowTileset = this.map.addTilesetImage('arrow');
        const boardTileset = this.map.addTilesetImage('board');
        const plankTileset = this.map.addTilesetImage('deti');
        const tableVTileset = this.map.addTilesetImage('table-V');
        const tableHTileset = this.map.addTilesetImage('table-H');
        const brickTileset = this.map.addTilesetImage('bricks');
        const chairTileset = this.map.addTilesetImage('chair');

        const allTiles = [
            wallTileset,
            utilTileset,
            tableTileset,
            jardimTileset,
            arrowTileset,
            boardTileset,
            plankTileset,
            tableVTileset,
            tableHTileset,
            brickTileset,
            chairTileset
        ]
        console.log('allTiles', tilesetImages, allTiles)

        this.map.createLayer('Ground', allTiles);
        this.map.createLayer('Room', allTiles);
        this.map.createLayer('Collision', allTiles);
        this.map.createLayer('Float', allTiles);

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
