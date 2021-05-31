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
        this.subscriptions = [];
    }

    create() {
        const mapManager = new MapManager();

        this.map = mapManager.buildMap(this);

        this.map.layers.forEach((layer) => {
            if (layer.name.startsWith("Float"))
                layer.tilemapLayer.setDepth(1000);
        })

        this.map.setLayer('Room');

        mapManager.buildObjects(this);

        // emit READY to dependent components
        useWorldEditorStore.getState().setReady();

        const width = this.map.widthInPixels,
            height = this.map.heightInPixels,
            margin = 100,
            paddingX = (window.screen.width - width - 2 * margin) / 4,
            paddingY = (window.screen.height - height - 2 * margin) / 4;

        this.cameras.main
            .setBounds(
                -margin - paddingX, -margin - paddingY,
                width + 2 * margin + 2 * paddingX, height + 2 * margin + 2 * paddingY, true)
            .setBackgroundColor("#0C1117")
            .setZoom(1.5).centerToBounds();

        this.cameras.main.roundPixels = true;   // prevent tiles bleeding (showing border lines on tiles)
        
        this.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W, 
            up2: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            in: Phaser.Input.Keyboard.KeyCodes.Q,
            out: Phaser.Input.Keyboard.KeyCodes.E,
        }, false);
        console.log(this.cameras)

        // this.physics.world.bounds.width = this.map.widthInPixels;
        // this.physics.world.bounds.height = this.map.heightInPixels;

        this.subscriptions.push(useWorldEditorStore.subscribe(
            (paintTool) => { this.paintTool = paintTool }, state => state.paintTool));


        this.game.input.events.on('unsubscribe', () => {
            this.subscriptions.forEach((unsub) => unsub());
        });
    }

    updateEdit = () => {
        if (!this.paintTool)
            return;

        let worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        // Rounds down to nearest tile
        let tileX = this.map.worldToTileX(worldPoint['x']);
        let tileY = this.map.worldToTileY(worldPoint['y']);

        const tile = this.map.getTileAt(tileX, tileY);
        tile && (tile.tint = '0xff00ff');

        // Snap to tile coordinates, but in world space
        // this.marker.x = this.map.tileToWorldX(tileX);
        // this.marker.y = this.map.tileToWorldY(tileY);


        // this.input.isOver is necessary to avoid interacting with the canvas through overlaying html elements
        if (this.input.manager.activePointer.isDown && this.input.isOver) {
            const activeLayerData = this.map.getLayer(useWorldEditorStore.getState().activeLayer);
            
            if (activeLayerData) {
                const activeLayer = activeLayerData.tilemapLayer;

                if (this.paintTool.type === PaintToolType.DRAW && this.paintTool.tileId) {
                    activeLayer.fill(this.paintTool.tileId, tileX, tileY, 1, 1);
                }
                else if (this.paintTool.type === PaintToolType.ERASE) {
                    activeLayer.fill(-1, tileX, tileY, 1, 1);
                }
                else if (this.paintTool.type === PaintToolType.PICK) {
                    const tile = activeLayer.getTileAt(tileX, tileY);
                    tile && useWorldEditorStore.getState().setPaintTool({tileId: tile.index})
                }
            }
        }
    }

    intToRGB(i) {
        var c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();
        return "00000".substring(0, 6 - c.length) + c;
    }
    

    updateCamera = () => {
        let x = this.cameras.main.scrollX,
            y = this.cameras.main.scrollY,
            z = this.cameras.main.zoom;

        if (this.cursors.up.isDown || this.cursors.up2.isDown) {
            y -= 5;
        }
        if (this.cursors.down.isDown || this.cursors.down2.isDown) {
            y += 5;
        }
        if (this.cursors.left.isDown || this.cursors.left2.isDown) {
            x -= 5;
        }
        if (this.cursors.right.isDown || this.cursors.right2.isDown) {
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
