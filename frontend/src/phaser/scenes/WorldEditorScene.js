import Phaser, { Scene } from 'phaser';

import MapManager from "../MapManager.ts";
import useWorldEditorStore, { PaintToolType } from "stores/useWorldEditorStore.ts";

const sceneConfig = {
    active: false,
    visible: false,
    key: 'WorldEditorScene',
};


class WorldEditorScene extends Scene {

    constructor() {
        super(sceneConfig);
        this.paintTool = null;
    }

    create() {
        const mapManager = new MapManager();
        this.map = mapManager.buildMap(this);
        mapManager.buildObjects(this);

        // emit READY to dependent components
        useWorldEditorStore.getState().setReady();

        const width = this.map.widthInPixels,
            height = this.map.heightInPixels,
            margin = 100,
            paddingX = (window.screen.width - width - 2 * margin) / 4,
            paddingY = (window.screen.height - height - 2 * margin) / 4;

        console.log(width, height, paddingX, paddingY)
        console.log(-margin - paddingX, -margin - paddingY, width + 2 * margin + 2 * paddingX, height + 2 * margin + 2 * paddingY)
        this.cameras.main
            .setBounds(-margin - paddingX, -margin - paddingY, width + 2 * margin + 2 * paddingX, height + 2 * margin + 2 * paddingY, true)
            .setBackgroundColor("#0C1117")
            .setZoom(1.5).centerToBounds();

        this.cameras.main.roundPixels = true;   // prevent tiles bleeding (showing border lines on tiles)

        this.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            in: Phaser.Input.Keyboard.KeyCodes.Q,
            out: Phaser.Input.Keyboard.KeyCodes.E,
        }, false);
        console.log(this.cameras)

        // this.physics.world.bounds.width = this.map.widthInPixels;
        // this.physics.world.bounds.height = this.map.heightInPixels;

        this.unsubscribe = useWorldEditorStore.subscribe(
            (paintTool) => { this.paintTool = paintTool }, state => state.paintTool);

        this.game.input.events.on('unsubscribe', () => {
            this.unsubscribe();
        });
    }

    updateEdit = () => {
        if (!this.paintTool)
            return;

        let worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        // Rounds down to nearest tile
        let tileX = this.map.worldToTileX(worldPoint['x']);
        let tileY = this.map.worldToTileY(worldPoint['y']);

        // Snap to tile coordinates, but in world space
        // this.marker.x = this.map.tileToWorldX(tileX);
        // this.marker.y = this.map.tileToWorldY(tileY);


        // this.input.isOver is necessary to avoid interacting with the canvas through overlaying html elements
        if (this.input.manager.activePointer.isDown && this.input.isOver) {
            console.log()

            if (this.paintTool.type === PaintToolType.DRAW && this.paintTool.tileId)
                this.map.fill(this.paintTool.tileId, tileX, tileY, 1, 1);
            else if (this.paintTool.type === PaintToolType.ERASE)
                this.map.fill(-1, tileX, tileY, 1, 1);
            else if (this.paintTool.type === PaintToolType.PICK) {
                const tile = this.map.getTileAt(tileX, tileY);
                tile && useWorldEditorStore.getState().setPaintTool({tileId: tile.index})
            }
        }
    }

    updateCamera = () => {
        let x = this.cameras.main.scrollX,
            y = this.cameras.main.scrollY,
            z = this.cameras.main.zoom;

        if (this.cursors.up.isDown) {
            y -= 5;
        }
        if (this.cursors.down.isDown) {
            y += 5;
        }
        if (this.cursors.left.isDown) {
            x -= 5;
        }
        if (this.cursors.right.isDown) {
            x += 5;
        }
        if (this.cursors.in.isDown) {
            z += 0.02;
        }
        if (this.cursors.out.isDown) {
            z -= 0.02;
        }
        this.cameras.main.setScroll(x, y);
        this.cameras.main.setZoom(z);
    }

    update() {
        this.updateCamera();
        this.updateEdit();
    }


}

export default WorldEditorScene;
