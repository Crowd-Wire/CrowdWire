import Phaser, { Scene } from 'phaser';


const sceneConfig = {
    active: false,
    visible: false,
    key: 'WorldEditorScene',
};


class WorldEditorScene extends Scene {
    
    constructor() {
        super(sceneConfig);
    }

    create() {
        const mapManager = this.registry.get('mapManager');

        this.map = mapManager.buildMap(this);

        // this.physics.world.bounds.width = this.map.widthInPixels;
        // this.physics.world.bounds.height = this.map.heightInPixels;

        this.cameras.main
            .setBounds(-100, -100, this.map.widthInPixels + 200, this.map.heightInPixels + 200, true)
            .setBackgroundColor("#0C1117")
            .setZoom(1.5);//.centerToBounds();

        this.cameras.main.roundPixels = true;   // prevent tiles bleeding (showing border lines on tiles)

        this.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        }, false);
        console.log(this.cameras)

    }

    update() {
        let x = this.cameras.main.scrollX;
        let y = this.cameras.main.scrollY;

        if (this.cursors.up.isDown) {
            y -= 4;
        }
        if (this.cursors.down.isDown) {
            y += 4;
        }
        if (this.cursors.left.isDown) {
            x -= 4;
        }
        if (this.cursors.right.isDown) {
            x += 4;
        }
        this.cameras.main.setScroll(x, y);

    }


}

export default WorldEditorScene;
