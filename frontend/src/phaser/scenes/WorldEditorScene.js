import Phaser, { Scene, GameObjects, Math } from 'phaser';

import MapManager from "../MapManager.ts";
import useWorldEditorStore, { ToolType } from "stores/useWorldEditorStore.ts";
import { cyrb53Hash, intToHex } from "utils/color.js";

const sceneConfig = {
    active: false,
    visible: false,
    key: 'WorldEditorScene',
};


class WorldEditorScene extends Scene {

    constructor() {
        super(sceneConfig);
        this.tool = { type: ToolType.DRAW };
        this.subscriptions = [];
    }

    create() {
        this.mapManager = new MapManager();

        this.map = this.mapManager.buildMap(this);

        this.map.layers.forEach((layer) => {
            if (layer.name.startsWith("Float"))
                layer.tilemapLayer.setDepth(1000);
        })

        this.objectGroups = this.mapManager.buildObjects(this);

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
                conferences[cid] = { name: `Conference ${index}`, color: `#${intToHex(cyrb53Hash(cid))}` };
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

        const grid1 = this.add.grid(width / 2, height / 2, width, height, 32, 32)
            .setOutlineStyle(0x000000, 0.9)
            .setDepth(1001);
        grid1.showOutline = false;

        const grid2 = this.add.grid(width / 2, height / 2, width, height, 16, 16)
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

        this.preview = new PreviewSprite(this, 0, 0);
        this.mouseClick = true;

        this.game.input.events.on('reset', () => { this.input.keyboard.resetKeys() });

        // Create the world borders
        // this.physics.world.bounds.width = this.map.widthInPixels;
        // this.physics.world.bounds.height = this.map.heightInPixels;

        this.subscriptions.push(useWorldEditorStore.subscribe(
            (tool) => { this.tool = tool }, state => state.tool));

        this.subscriptions.push(useWorldEditorStore.subscribe(
            this.handleLayersChange, state => [{ ...state.layers }, state.highlight]));

        this.subscriptions.push(useWorldEditorStore.subscribe(
            this.handleConferencesChange, state => Object.keys(state.conferences)));

        this.subscriptions.push(useWorldEditorStore.subscribe(
            (grid) => { grid1.showOutline = grid2.showOutline = grid }, state => state.grid));

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
                return;
            }

            const activeObjectGroup = this.objectGroups[name];
            if (activeObjectGroup) {
                activeObjectGroup.setVisible(layer.visible);
                activeObjectGroup.setAlpha(layer.active || !highlight ? 1 : 0.4);
                return;
            }
        });
    }

    fillBFS(layer, tileId, x, y, tint) {
        const replaceId = layer.getTileAt(x, y, true).index;

        if (tileId === replaceId) {
            // Nothing to do, avoid loop
            return;
        }

        const queue = [{ x, y }];

        while (queue.length > 0) {
            const { x, y } = queue.shift(),
                destinations = [{ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 }];

            for (const dest of destinations) {
                const { x, y } = dest,
                    tile = layer.getTileAt(x, y, true);

                if (tile && tile.index === replaceId) {
                    layer.fill(tileId, x, y, 1, 1);
                    tint && (tile.tint = tint);
                    queue.push(dest);
                }
            }
        }
    }

    updateEdit = () => {
        if (!this.tool)
            return;

        if (this.input.isOver) {
            // Mouse is over canvas

            const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main),
                activeLayerName = useWorldEditorStore.getState().activeLayer;

            if (activeLayerName && !useWorldEditorStore.getState().layers[activeLayerName].blocked) {
                // Layer selected and not blocked

                this.preview.setVisible(true);

                const activeLayer = this.map.getLayer(activeLayerName)?.tilemapLayer;
                if (activeLayer) {
                    // TilemapLayer exists

                    const x = Math.Snap.Floor(worldPoint.x, 32),
                        y = Math.Snap.Floor(worldPoint.y, 32);

                    // Rounds down to nearest tile
                    const tileX = this.map.worldToTileX(x),
                        tileY = this.map.worldToTileY(y);

                    const activeTile = useWorldEditorStore.getState().active.tile
                        || useWorldEditorStore.getState().active.conference;

                    let activeGid, tint = 0xffffff;
                    if (activeTile && activeTile[0] === 'C') {
                        activeGid = this.mapManager.getConferenceGid(activeTile);
                        tint = `0x${useWorldEditorStore.getState().conferences[activeTile].color.substr(1)}`;

                        if (!activeGid)
                            throw Error(`Could not find GID of ${activeTile}`);
                    } else {
                        activeGid = activeTile;
                    }

                    let clickedGid, clickedCid;
                    const clickedTile = activeLayer.getTileAt(tileX, tileY, true);
                    if (clickedTile) {
                        // Check if index is from a conference tile and set active tile accordingly
                        clickedCid = this.mapManager.getConferenceCid(clickedTile.index);
                        clickedGid = clickedTile.index;
                    }

                    this.preview.setPosition(x + 16, y + 16);
                    if ([ToolType.DRAW, ToolType.FILL, ToolType.SELECT].includes(this.tool.type)
                        && activeGid) {
                        const tileset = activeLayer.gidMap[activeGid];
                        this.preview.setTexture(tileset.image.key, activeGid - tileset.firstgid);
                    } else {
                        this.preview.setTexture('__DEFAULT');
                    }

                    if (x < 0 || this.map.widthInPixels <= x || y < 0 || this.map.heightInPixels <= y)
                        return false;

                    const isDown = this.input.manager.activePointer.isDown;
                    switch (this.tool.type) {
                        case ToolType.DRAW:
                            if (activeGid) {
                                if (isDown) {
                                    activeLayer.fill(activeGid, tileX, tileY, 1, 1);
                                    clickedTile && (clickedTile.tint = tint);
                                }
                                return true;
                            }
                            break;
                        case ToolType.ERASE:
                            if (isDown) {
                                activeLayer.fill(-1, tileX, tileY, 1, 1);
                            }
                            return true;
                        case ToolType.PICK:
                            if (clickedGid != -1) {
                                if (isDown) {
                                    useWorldEditorStore.getState().setActive('tile', clickedCid || clickedGid);
                                }
                                return true;
                            }
                            break;
                        case ToolType.FILL:
                            if (activeGid) {
                                if (isDown) {
                                    this.fillBFS(activeLayer, activeGid, tileX, tileY, tint);
                                }
                                return true;
                            }
                            break;
                        case ToolType.SELECT:
                            break;
                    }
                    return false;
                }
                const activeObjectGroup = this.objectGroups[activeLayerName];
                if (activeObjectGroup) {
                    // ObjectGroup exists

                    const x = Math.Snap.Floor(worldPoint.x, 16),
                        y = Math.Snap.Floor(worldPoint.y, 16);

                    const activeObject = useWorldEditorStore.getState().active.object;
                    const rec = this.mapManager.objectBody[activeObject];

                    this.preview.setPosition(x + 16, y + 16)
                        .setTexture(activeObject || '__DEFAULT')
                        .setBounds(rec);

                    if (x < 0 || this.map.widthInPixels <= x || y < 0 || this.map.heightInPixels <= y)
                        return false;

                    const hovered = this.physics.overlapRect(
                        this.preview.body.x + 1,
                        this.preview.body.y + 1,
                        this.preview.body.width - 2,
                        this.preview.body.height - 2,
                        true, true
                    );
                    if (hovered.length < 2) {
                        if (this.input.manager.activePointer.isDown) {
                            if (this.mouseClick) {
                                let obj = this.add.sprite(this.preview.x, this.preview.y, activeObject);
                                activeObjectGroup.add(obj);
                                const { width, height, offset } = this.preview.body;
                                obj.body.setSize(width, height)
                                    .setOffset(
                                        offset.x + this.preview.getSprite().width / 2,
                                        offset.y + this.preview.getSprite().height / 2);
                                this.mouseClick = false;
                            }
                        } else {
                            this.mouseClick = true;
                        }
                        return true;
                    }
                    return false;
                }
                throw Error(`Unknown layer name ${activeLayerName}`)
            }
        }
        this.preview.setVisible(false);
        return false;
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
        this.updateEdit() ? this.preview.setValid() : this.preview.setError();
    }
}


/**
 * The preview sprite of the current tool object.
 * 
 * @constructor
 * @param {Scene} scene - The scene that has the sprite.
 * @param {number} x - The start horizontal position in the scene.
 * @param {number} y - The start vertical position in the scene.
 */
class PreviewSprite extends GameObjects.Container {

    constructor(scene, x, y) {
        super(scene, x, y);

        // Add container to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // add sprite and text to scene and then container
        const sprite = scene.add.sprite(0, 0, '__DEFAULT')
            .setAlpha(0.7);

        const rec = scene.add.rectangle(0, 0, 32, 32)
            .setOrigin(0)
            .setPosition(-sprite.width / 2, -sprite.height / 2)
            .setSize(sprite.width, sprite.height)
            .setStrokeStyle(2, 0x00ff00, 1);

        this.addSprite(sprite)
            .addRectangle(rec)
            .setDepth(1001);

        this.body.setSize(32, 32)
            .setOffset(-16, -16);
    }

    addSprite(sprite) {
        return this.addAt(sprite, 0);
    }

    getSprite() {
        return this.getAt(0);
    }

    addRectangle(bounds) {
        return this.addAt(bounds, 1);;
    }

    getRectangle() {
        return this.getAt(1);
    }

    setTexture(key, frame) {
        this.getSprite().setTexture(this.scene.textures.get(key), frame);
        return this;
    }

    setBounds(rec) {
        const { width, height } = this.getSprite().getBounds();
        if (!rec) {
            this.body.setOffset(-width / 2, -height / 2)
                .setSize(width, height);
            this.getRectangle().setPosition(-width / 2, -height / 2)
                .setSize(width, height);
        } else {
            this.body.setOffset(rec.x - width / 2, rec.y - height / 2)
                .setSize(rec.width, rec.height);
            this.getRectangle().setPosition(rec.x - width / 2, rec.y - height / 2)
                .setSize(rec.width, rec.height);
        }
        return this;
    }

    setError() {
        this.getRectangle().setStrokeStyle(2, 0xff0000);
        this.getSprite().setTint(0xff0000);
        return this;
    }

    setValid() {
        this.getRectangle().setStrokeStyle(2, 0x0000ff);
        this.getSprite().setTint(0xffffff);
        return this;
    }
}

export default WorldEditorScene;
