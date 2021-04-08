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
        this.load.image('tiles',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/wall-tiles.png`)
        // map in json format
        this.load.tilemapTiledJSON('map', `${process.env.PUBLIC_URL}/assets/tilemaps/maps/staticmap.json`);
        // our two characters???
        this.load.spritesheet('player', `${process.env.PUBLIC_URL}/assets/characters/RPG_assets.png`, { frameWidth: 16, frameHeight: 16 });

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