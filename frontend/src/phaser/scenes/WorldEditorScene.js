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
        this.paintTool = null;
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
            .filter((tileset) => tileset.name.startsWith('__conference'))
            .forEach((tileset, index) => {
                const cid = tileset.name.substr(12);
                conferences[cid] = {name: `Conference ${index}`, color: `#${intToHex(cyrb53Hash(cid))}`};
            });
        useWorldEditorStore.getState().setState({ conferences });

        // Emit READY to dependent components
        useWorldEditorStore.getState().setState({ ready: true });

        // const newTileset = new Tilemaps.Tileset('__conference2', 1000, 32, 32, 0, 0, [{
        //     "name":"idgeneral",
        //     "type":"string",
        //     "value":"C1"
        //    }]).setImage(this.textures.get('util-tiles')).updateTileData(96, 64);
        // const newTileset = this.map.addTilesetImage("util-tile");

        //  addTilesetImage: function (tilesetName, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid)
        // const newTileset = this.map.addTilesetImage('__conference2', 'util-tiles', 32, 32, 0, 0, 1000,);

        // newTileset = new Tileset(tilesetName, gid, tileWidth, tileHeight, tileMargin, tileSpacing);
        

        // this.map.getLayer('Room').tilemapLayer.tileset.splice(5, 1);
        // this.map.getLayer('Room').tilemapLayer.setTilesets(this.map.getLayer('Room').tilemapLayer.tileset);
        // this.map.tilesets.splice(h-1, 1);

        // newTileset.firstgid = 1000;

        // this.map.tilesets.push( 
        //     newTileset
        // )
        // this.map.getLayer('Room').tilemapLayer.tileset.push(newTileset);
        /*
        this.mapManager.addConference('C0');

        this.map.getLayer('Room').tilemapLayer.fill(100000, 1, 1, 1, 1);
        const v = this.map.getTileAt(1, 1, false, 'Room');
        // v.tileset = newTileset;
        v.tint = 0x00ff00;
        console.log(v);
        
        const w = this.map.getTileAt(14, 5, false, 'Room');
        w && (w.tint = 0x00ff00);
        console.log(w);*/

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

        this.game.input.events.on('reset', () => { this.input.keyboard.resetKeys() });

        // this.physics.world.bounds.width = this.map.widthInPixels;
        // this.physics.world.bounds.height = this.map.heightInPixels;

        this.subscriptions.push(useWorldEditorStore.subscribe(
            (paintTool) => { this.paintTool = paintTool }, state => state.paintTool));

        this.subscriptions.push(useWorldEditorStore.subscribe(
            this.handleLayersChange, state => [{...state.layers}, state.highlight]));

        this.subscriptions.push(useWorldEditorStore.subscribe(
            this.handleConferencesChange, state => Object.keys(state.conferences)));

        this.game.input.events.on('unsubscribe', () => {
            this.subscriptions.forEach((unsub) => unsub());
        });
    }

    handleConferencesChange = (conferences, prevConferences) => {
        console.log(prevConferences, conferences)
        if (conferences.length > prevConferences.length) {
            // add conference
            for (const cid of conferences) {
                if (prevConferences.indexOf(cid) < 0) {
                    console.log('ADD')
                    this.mapManager.addConference(cid);
                    break;
                }
            }
            console.log(this.map)

        } else if (conferences.length < prevConferences.length) {
            // del conference
            for (const cid of prevConferences) {
                if (conferences.indexOf(cid) < 0) {
                    console.log('DEL')

                    this.mapManager.removeConference(cid);
                    break;
                }
            }
            console.log(this.map)
        }
    }

    handleLayersChange = ([layers, highlight]) => {
        console.log(this)
        
        Object.entries(layers).forEach(([name, layer]) => {
            const activeLayer = this.map.getLayer(name)?.tilemapLayer;
    
            if (activeLayer) {
                // Layer exists
                activeLayer.setVisible(layer.visible);
                activeLayer.setAlpha(layer.active || !highlight ? 1 : 0.5);
            } else if (name === 'Object') {
                this.group.setVisible(layer.visible);
                this.group.setAlpha(layer.active || !highlight ? 1 : 0.5);
            } else if (name === 'ObjectCollision') {
                this.collisionGroup.setVisible(layer.visible);
                this.collisionGroup.setAlpha(layer.active || !highlight ? 1 : 0.5);
            }
        })
    }

    updateEdit = () => {
        if (!this.paintTool)
            return;
        
        // this.input.isOver is necessary to avoid interacting with the canvas through overlaying html elements
        if (this.input.manager.activePointer.isDown && this.input.isOver) {
            const activeLayerName = useWorldEditorStore.getState().activeLayer;

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
                    if (this.paintTool.type === PaintToolType.DRAW && this.paintTool.tileId) {
                        let tileId = this.paintTool.tileId;
                        console.log(tileId)
                        if (tileId[0] === 'C') {
                            const tint = `0x${useWorldEditorStore.getState().conferences[tileId].color.substr(1)}`;
                            console.log(tint);
                            tileId = this.mapManager.getConferenceId(tileId);
                            activeLayer.fill(tileId, tileX, tileY, 1, 1);
                            const tile = activeLayer.getTileAt(tileX, tileY, false, activeLayerName);
                            console.log(tint)
                            tile.tint = tint;
                            console.log(tile)
                        } else {
                            activeLayer.fill(tileId, tileX, tileY, 1, 1);
                        }
                    }
                    else if (this.paintTool.type === PaintToolType.ERASE) {
                        activeLayer.fill(-1, tileX, tileY, 1, 1);
                    }
                    else if (this.paintTool.type === PaintToolType.PICK) {
                        const tile = activeLayer.getTileAt(tileX, tileY, false /**bug if true */, activeLayerName);
                        tile && useWorldEditorStore.getState().setPaintTool({ tileId: tile.index })
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
