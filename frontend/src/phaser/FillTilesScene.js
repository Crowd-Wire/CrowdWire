import * as Phaser from 'phaser';

const sceneConfig = {
//     type: Phaser.WEBGL,
//     width: 800,
//     height: 600,
//     backgroundColor: '#2d2d2d',
//     parent: 'phaser-example',
//     pixelArt: true,
    key: 'FillTilesScene',
    autoResize: true,//n faz nasda
};

class FillTilesScene extends Phaser.Scene {

    constructor() {
        super(sceneConfig);
    }

    preload() {
        this.load.image('tiles2',`${process.env.PUBLIC_URL}/assets/tilemaps/tiles/wall-tiles.png`)
        this.load.tilemapTiledJSON('map2', `${process.env.PUBLIC_URL}/assets/tilemaps/maps/mymap3.json`);
    }

    create() {
        
        this.map = this.add.tilemap('map2');
        let tiles = this.map.addTilesetImage('wall-tiles', 'tiles2');

        let layer = this.map.createLayer('Tile Layer 1', tiles, 0, 0);

        
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        let cursors = this.input.keyboard.createCursorKeys();
        let controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            speed: 0.5
        };
        this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

        let help = this.add.text(16, 16, "Left-click to fill the selected region.\nKey A to change scene.", {
            fontFamily: 'Arial',
            fontSize: '18px',
            padding: { x: 10, y: 5 },
            backgroundColor: '#000000',
            fill: '#ffffff'
        });
        help.setScrollFactor(0);

        this.input.keyboard.on('keydown-A', () => {
            // this.cameras.resetAll();
            // this.scene.transition({ target: 'GameScene', duration: 2000 });
            this.scene.start('GameScene');
        }, this);
    }

    update(time, delta) {
        this.controls.update(delta);

        
        let worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        
        // Rounds down to nearest tile
        let pointerTileX = this.map.worldToTileX(worldPoint['x']);
        let pointerTileY = this.map.worldToTileY(worldPoint['y']);

        // Snap to tile coordinates, but in world space
        this.marker.x = this.map.tileToWorldX(pointerTileX);
        this.marker.y = this.map.tileToWorldY(pointerTileY);
        
        // this.input.isOver is necessary to avoid interacting with the canvas through overlaying html elements
        if (this.input.manager.activePointer.isDown && this.input.isOver)
        {
            console.log("clicou-me primeiro")
            // Fill the tiles within an area with sign posts (tile id = 46)
            this.map.fill(1, pointerTileX, pointerTileY, 6, 6);
        }

        
    }
}

export default FillTilesScene;



