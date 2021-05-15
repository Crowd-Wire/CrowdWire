import * as Phaser from 'phaser';


const sceneConfig = {
    active: false,// hum, n sei o q faz ainda
    visible: false,// same
    key: 'BootScene',
};

class BootScene extends Phaser.Scene {
    
    constructor() {
        super(sceneConfig);
        this.count = 0;
    }

    preload() {
        // map tiles
        this.load.image('wall-tiles',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/wall-tiles.png`);
        this.load.image('util-tiles',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/util-tiles.png`);
        this.load.image('table-tiles',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-tiles.png`);
        this.load.image('table-V',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-V.png`);
        this.load.image('table-H',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/table-H.png`);
        this.load.image('jardim',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/jardim.png`);
        this.load.image('wooden-plank',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/wooden-plank.png`);
        this.load.image('arrow',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/arrow.png`);
        this.load.image('board',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/board.png`);
        this.load.image('bricks',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/bricks.png`);
        this.load.image('chair',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/chair.png`);

        // map in json format
        this.load.tilemapTiledJSON('map', `${process.env.PUBLIC_URL}/assets/tilemaps/maps/minimap.json`);
        // our two characters???
        this.load.spritesheet('player', `${process.env.PUBLIC_URL}/assets/characters/RPG_assets.png`, { frameWidth: 16, frameHeight: 16 });

        this.load.bitmapFont('atari', `${process.env.PUBLIC_URL}/assets/fonts/bitmap/gem.png`, `${process.env.PUBLIC_URL}/assets/fonts/bitmap/gem.xml`);
    }

    create() {
        this.marker = this.add.graphics();
        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.strokeRect(0, 0, 6 * 32, 6 * 32);

        this.scene.start('GameScene');
    }

    update() {
        this.count += 1;
        this.text.setText(`${this.count}`)
    }
    
}

export default BootScene;