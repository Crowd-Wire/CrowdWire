import Tilemap from "phaser/src/tilemaps/Tilemap";
import TilemapLayer from "phaser/src/tilemaps/TilemapLayer";
import Scene from "phaser/src/scene/Scene";

import WorldService from "services/WorldService.js";

import exampleJson from "assets/tilemaps/maps/test.json";

import { API_BASE } from "config";

const wallTiles = require("assets/tilemaps/tiles/wall-tiles.png");

enum MapManagerState {
    FETCHED = "FETCHED",
    LOADED = "LOADED",
    BUILT = "BUILT",
}

// interface Layers {
//     floatLayers: TilemapLayer[];
//     groundLayers: TilemapLayer[];
//     collisionLayer: TilemapLayer;
//     roomLayer: TilemapLayer;
// }

class MapManager {
    // private layers: Layers;
    private map: Tilemap;
    private mapJson: any;
    private state: MapManagerState;
    private worldId: string;

    constructor(worldId: string) {
        this.worldId = worldId;
    }

    fetchMap(): void {
        //     WorldService.getWorldDetails(world_id)
        //         .then((res) => {
        //             console.log(res.json());
        //         })

        fetch(API_BASE + "static/default_map.json", {
            method: 'GET',
            // mode: 'cors',
            // headers: {
            //     "Authorization": "Bearer " + AuthenticationService.getToken()
            // }
        }).then((res) => {
            return res.json();
        }).then((res) => {
            this.mapJson = res;
            console.log(this.mapJson, typeof(this.mapJson));
            // this.state = MapManagerState.FETCHED;
        })
        this.state = MapManagerState.FETCHED;
    }

    loadMap(scene: Scene): void {
        if (this.state !== MapManagerState.FETCHED)
            throw Error("Illegal call to function with the current state.");

        // map in json format
        // var hmmm = scene.load.tilemapTiledJSON('map', API_BASE + "static/default_map.json");
        var hmmm = scene.load.tilemapTiledJSON('map', exampleJson);
        console.log('hmmmm', hmmm)

        // map tiles
        scene.load.image('wall-tiles', wallTiles);
        scene.load.image('util-tiles',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/util-tiles.png`);
        scene.load.image('table-tiles',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-tiles.png`);
        scene.load.image('table-V',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-V.png`);
        scene.load.image('table-H',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-H.png`);
        scene.load.image('jardim',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/jardim.png`);
        scene.load.image('wooden-plank',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/wooden-plank.png`);
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

        const wallTileset = this.map.addTilesetImage('wall-tiles');

        const utilTileset = this.map.addTilesetImage('util-tiles');
        const tableTileset = this.map.addTilesetImage('table-tiles');
        const jardimTileset = this.map.addTilesetImage('jardim');
        const arrowTileset = this.map.addTilesetImage('arrow');
        const boardTileset = this.map.addTilesetImage('board');
        const plankTileset = this.map.addTilesetImage('wooden-plank');
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

        this.map.createDynamicLayer('Ground', allTiles);
        this.map.createDynamicLayer('Room', allTiles);
        this.map.createDynamicLayer('Collision', allTiles);
        this.map.createDynamicLayer('Float', allTiles);

        this.state = MapManagerState.BUILT;
    }

    saveMap(): void {
        if (this.state !== MapManagerState.BUILT)
            throw Error("Illegal call to function with the current state.");
    }

    getTilemap(): Tilemap {
        if (this.state !== MapManagerState.BUILT)
            throw Error("Illegal call to function with the current state.");
        return this.map;
    }
}

export default MapManager;
