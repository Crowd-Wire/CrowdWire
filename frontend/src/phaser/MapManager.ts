import Tilemap from "phaser/src/tilemaps/Tilemap";
import TilemapLayer from "phaser/src/tilemaps/TilemapLayer";
import Scene from "phaser/src/scene/Scene";

import WorldService from "services/WorldService.js";

import { API_BASE } from "config";


enum MapManagerState {
    FETCHED,
    LOADED,
    BUILT,
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

    async fetchMap(): Promise<void> {
        this.mapJson = require(API_BASE + "static/default_map.json");
        console.log(this.mapJson, typeof(this.mapJson))
        //     WorldService.getWorldDetails(world_id)
        //         .then((res) => {
        //             console.log(res.json());
        //         })

        this.state = MapManagerState.FETCHED;
    }

    loadMap(scene: Scene): void {
        if (this.state !== MapManagerState.FETCHED)
            throw Error("Illegal call to function with the current state.");

        // map in json format
        scene.load.tilemapTiledJSON('map', this.mapJson);



        // map tiles
        // this.load.image('wall-tiles', wallTiles);
        // this.load.image('util-tiles',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/util-tiles.png`);
        // this.load.image('table-tiles',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-tiles.png`);
        // this.load.image('table-V',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-V.png`);
        // this.load.image('table-H',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-H.png`);
        // this.load.image('jardim',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/jardim.png`);
        // this.load.image('wooden-plank',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/wooden-plank.png`);
        // this.load.image('arrow',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/arrow.png`);
        // this.load.image('board',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/board.png`);
        // this.load.image('bricks',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/bricks.png`);
        // this.load.image('chair',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/chair.png`);

        

        this.state = MapManagerState.LOADED;
    }

    buildMap(scene: Scene): void {
        if (this.state !== MapManagerState.LOADED)
            throw Error("Illegal call to function with the current state.");

        this.map = scene.add.tilemap('map');

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