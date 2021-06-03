import Phaser, { Scene, Tilemaps } from 'phaser';

import MapManager from "../MapManager.ts";
import useWorldEditorStore, { PaintToolType } from "stores/useWorldEditorStore.ts";
import { cyrb53Hash, intToHex } from "utils/color.js";

const sceneConfig = {
    active: false,
    visible: false,
    key: 'WorldEditorScene',
};


class WorldEditorScene extends Scene {

    constructor() {
        super(sceneConfig);
        this.paintTool = { type: PaintToolType.DRAW };
        this.subscriptions = [];
    }

    create() {
        this.mapManager = new MapManager();

        this.map = this.mapManager.buildMap(this);

        this.map.layers.forEach((layer) => {
            if (layer.name.startsWith("Float"))
                layer.tilemapLayer.setDepth(1000);
        })

        const { group, collisionGroup } = this.mapManager.buildObjects(this);
        Object.assign(this, { group, collisionGroup });

        // Initialize layers on store
        const layers = {};
        this.map.objects.concat(this.map.layers).forEach((layer) =>
            layers[layer.name] = { visible: true, blocked: false, active: false })
        useWorldEditorStore.getState().addLayers(layers);

        // Initialize conferences on store
        const conferences = {};
        this.map.tilesets
            .filter((tileset) => tileset.name.startsWith('_conferenceC'))
            .forEach((tileset, index) => {
                const cid = tileset.name.substr(12);
                conferences[cid] = {name: `Conference ${index}`, color: `#${intToHex(cyrb53Hash(cid))}`};
            });
        useWorldEditorStore.getState().setState({ conferences });

        // Emit READY to dependent components
        useWorldEditorStore.getState().setState({ ready: true });

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
        
        const grid1 = this.add.grid(width/2, height/2, width, height, 32, 32)
            .setOutlineStyle(0x000000, 0.9)
            .setDepth(1001);
        grid1.showOutline = false;

        const grid2 = this.add.grid(width/2, height/2, width, height, 16, 16)
            .setOutlineStyle(0x000000, 0.2)
            .setDepth(1001);
        grid2.showOutline = false;

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

        this.game.input.events.on('reset', () => { this.input.keyboard.resetKeys() });

        // this.physics.world.bounds.width = this.map.widthInPixels;
        // this.physics.world.bounds.height = this.map.heightInPixels;

        this.subscriptions.push(useWorldEditorStore.subscribe(
            (paintTool) => { this.paintTool = paintTool }, state => state.paintTool));

        this.subscriptions.push(useWorldEditorStore.subscribe(
            this.handleLayersChange, state => [{...state.layers}, state.highlight]));

        this.subscriptions.push(useWorldEditorStore.subscribe(
            this.handleConferencesChange, state => Object.keys(state.conferences)));

        this.subscriptions.push(useWorldEditorStore.subscribe(
            (grid) => {grid1.showOutline = grid2.showOutline = grid }, state => state.grid));

        this.game.input.events.on('unsubscribe', () => {
            this.subscriptions.forEach((unsub) => unsub());
        });
    }

    handleConferencesChange = (conferences, prevConferences) => {
        if (conferences.length > prevConferences.length) {
            // Add conference
            for (const cid of conferences) {
                if (prevConferences.indexOf(cid) < 0) {
                    this.mapManager.addConference(cid);
                    break;
                }
            }
        } else if (conferences.length < prevConferences.length) {
            // Delete conference
            for (const cid of prevConferences) {
                if (conferences.indexOf(cid) < 0) {
                    this.mapManager.removeConference(cid);
                    break;
                }
            }
        }
    }

    handleLayersChange = ([layers, highlight]) => {
        Object.entries(layers).forEach(([name, layer]) => {
            const activeLayer = this.map.getLayer(name)?.tilemapLayer;
    
            if (activeLayer) {
                // Layer exists
                activeLayer.setVisible(layer.visible);
                activeLayer.setAlpha(layer.active || !highlight ? 1 : 0.4);
            } else if (name === 'Object') {
                this.group.setVisible(layer.visible);
                this.group.setAlpha(layer.active || !highlight ? 1 : 0.4);
            } else if (name === 'ObjectCollision') {
                this.collisionGroup.setVisible(layer.visible);
                this.collisionGroup.setAlpha(layer.active || !highlight ? 1 : 0.4);
            }
        });
    }

    fillBFS(layer, tileId, x, y, tint) {
        let count = 400;
        const replaceId = layer.getTileAt(x, y, true).index,
            queue = [{ x, y }];

        console.log(layer, tileId, x, y, tint)
    
        while (queue.length > 0) {
            const { x, y } = queue.shift(),
                destinations = [{ x: x-1, y }, { x: x+1, y }, { x, y: y-1 }, { x, y: y+1 }];
    
            for (const dest of destinations) {
                const { x, y } = dest,
                    tile = layer.getTileAt(x, y, true);

                if (tile && tile.index === replaceId) {
                    console.log(tile.index, replaceId)
                    layer.fill(tileId, x, y, 1, 1);
                    tint && (tile.tint = tint);
                    queue.push(dest);
                    if (count-- < 0)
                        return;
                }
            }
        }
    }

    updateEdit = () => {
        if (!this.paintTool)
            return;
        
        // this.input.isOver is necessary to avoid interacting with the canvas through overlaying html elements
        if (this.input.manager.activePointer.isDown && this.input.isOver) {
            const activeLayerName = useWorldEditorStore.getState().activeLayer,
                activeTile = useWorldEditorStore.getState().activeTile;

            let worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

            // Rounds down to nearest tile
            let tileX = this.map.worldToTileX(worldPoint['x']);
            let tileY = this.map.worldToTileY(worldPoint['y']);
            
            // const tile = this.map.getTileAt(tileX, tileY, true, activeLayerName);
            // // console.log(tile)
            // // const color = intToHex(cyrb53Hash(this.paintTool.conferenceId), 129)
            // // console.log(color)
            // tile && this.paintTool?.conferenceId && (tile.tint = 0x197cb0);

            if (activeLayerName && !useWorldEditorStore.getState().layers[activeLayerName].blocked) {
                // Layer selected and not blocked
                const activeLayer = this.map.getLayer(activeLayerName)?.tilemapLayer;
    
                if (activeLayer) {
                    // Layer exists
                    if (this.paintTool.type === PaintToolType.DRAW && activeTile) {
                        let tileId = activeTile;
                        if (tileId[0] === 'C') {
                            const tint = `0x${useWorldEditorStore.getState().conferences[tileId].color.substr(1)}`;
                            tileId = this.mapManager.getConferenceGid(tileId);
                            if (tileId) {
                                activeLayer.fill(tileId, tileX, tileY, 1, 1);
                                const tile = activeLayer.getTileAt(tileX, tileY, false, activeLayerName);
                                tile.tint = tint;
                            }
                        } else {
                            activeLayer.fill(tileId, tileX, tileY, 1, 1);
                        }
                    }
                    else if (this.paintTool.type === PaintToolType.ERASE) {
                        activeLayer.fill(-1, tileX, tileY, 1, 1);
                    }
                    else if (this.paintTool.type === PaintToolType.PICK) {
                        const tile = activeLayer.getTileAt(tileX, tileY, false /**bug if true */, activeLayerName);
                        if (tile) {
                            // Check if index is from a conference tile and set active tile accordingly
                            const cid = this.mapManager.getConferenceCid(tile.index);
                            useWorldEditorStore.getState().setState({ activeTile: cid || tile.index })
                        }
                    } else if (this.paintTool.type === PaintToolType.FILL) {
                        const tile = activeLayer.getTileAt(tileX, tileY, false /**bug if true */, activeLayerName);
                        if (tile) {
                            // Check if index is from a conference tile and set active tile accordingly
                            const cid = this.mapManager.getConferenceCid(tile.index);
                            const tileIndex = cid || tile.index;

                            console.log(tileId, tileIndex)

                            let tileId = activeTile;
                            if (tileId[0] === 'C') {
                                const tint = `0x${useWorldEditorStore.getState().conferences[tileId].color.substr(1)}`;
                                tileId = this.mapManager.getConferenceGid(tileId);
                                if (tileId && tileId != tileIndex) {
                                    this.fillBFS(activeLayer, tileId, tileX, tileY, tint);
                                }
                            } else if (tileId != tileIndex) {
                                console.log('entriy')
                                this.fillBFS(activeLayer, tileId, tileX, tileY);
                            }
                        }
                    }
                }
            }
        }
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
