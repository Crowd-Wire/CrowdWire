import Phaser, { Scene, GameObjects, Math, Geom } from 'phaser';

import MapManager from "../MapManager.ts";
import WallManager from "../WallManager.ts";
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
            if (layer.name.includes("Float"))
                layer.tilemapLayer.setDepth(1000);
            if (layer.name.includes("Collision"))
                layer.tilemapLayer.setDepth(500);
        })
        this.objectGroups = this.mapManager.buildObjects(this);

        this.wallManager = new WallManager(
            this.map.getLayer('__Collision'),
            this.map.getLayer('__Float')
        );

        // Initialize layers on stores
        const layers = {};
        this.map.objects.concat(this.map.layers).forEach((layer) =>
            layers[layer.name] = { visible: true, blocked: false, active: false })
        useWorldEditorStore.getState().addLayers(layers);

        // Initialize conferences on store
        const conferences = {};
        this.map.tilesets
            .filter((tileset) => tileset.name.startsWith('__CONFERENCE_'))
            .forEach((tileset, index) => {
                const cid = tileset.name.match(/__CONFERENCE_(C\d+)/)[1];
                const name = this.mapManager.tilesetProps[tileset.name].properties?.name || `Conference C${index}`;
                conferences[cid] = { name, color: `#${intToHex(cyrb53Hash(cid))}` };
            });
        useWorldEditorStore.getState().setState({ conferences });

        // Paint conference tiles
        this.map.getLayer('__Conference').tilemapLayer
            .filterTiles((tile) => tile.index != -1)
            .forEach((tile) => {
                const cid = tile.properties.conference;
                tile.tint = `0x${intToHex(cyrb53Hash(cid))}`;
            });

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
            .setOutlineStyle(0x000000, 0.8)
            .setDepth(1001);
        grid1.showOutline = false;

        const grid2 = this.add.grid(width / 2, height / 2, width, height, 16, 16)
            .setOutlineStyle(0x000000, 0.3)
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
        this.save = false;

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

        this.subscriptions.push(useWorldEditorStore.subscribe(
            (save) => { this.save = save }, state => state.save));

        this.game.input.events.on('unsubscribe', () => {
            this.subscriptions.forEach((unsub) => unsub());
        });

        // Emit READY to dependent components
        useWorldEditorStore.getState().setState({ ready: true });

        this.flag = false;
        this.input.keyboard.on('keydown-P', () => {
            this.flag = !this.flag;
        }, this);
    }

    handleConferencesChange = (conferences, prevConferences) => {
        if (conferences.length > prevConferences.length) {
            // Add conference
            for (const cid of conferences) {
                if (prevConferences.indexOf(cid) < 0) {
                    this.mapManager.addConference(cid, { name: conferences.name });
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
                tile = layer.getTileAt(x, y, true);

            if (tile && tile.index === replaceId) {
                layer.fill(tileId, x, y, 1, 1);
                tint && (tile.tint = tint);
                queue.push({ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 });
            }
        }
    }

    updateEdit = () => {
        if (!this.tool)
            return;

        if (this.input.isOver) {
            // Mouse is over canvas

            const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main),
                storeActiveLayer = useWorldEditorStore.getState().activeLayer,
                activeConference = useWorldEditorStore.getState().active.conference,
                activeWall = useWorldEditorStore.getState().active.wall;

            this.preview.setVisible(true);

            const activeLayerName = (activeWall && !useWorldEditorStore.getState().layers['__Collision'].blocked) ? '__Collision' :
                (activeConference && !useWorldEditorStore.getState().layers['__Conference'].blocked) ? '__Conference' :
                    (storeActiveLayer && !useWorldEditorStore.getState().layers[storeActiveLayer].blocked) ? storeActiveLayer :
                        undefined;

            if (activeLayerName) {
                // Conference selected and not blocked 
                // or other layer selected and not blocked

                const activeLayer = this.map.getLayer(activeLayerName)?.tilemapLayer;
                if (activeLayer) {
                    // TilemapLayer exists

                    const x = Math.Snap.Floor(worldPoint.x, 32),
                        y = Math.Snap.Floor(worldPoint.y, 32);

                    this.preview.setPosition(x + 16, y + 16).setBounds();

                    // Rounds down to nearest tile
                    const tileX = this.map.worldToTileX(x),
                        tileY = this.map.worldToTileY(y);

                    const activeTile = useWorldEditorStore.getState().active.tile
                        || activeConference;

                    if (!activeTile && activeWall) {
                        // Wall selected
                        this.preview.setTexture('__DEFAULT');

                        const isDown = this.input.manager.activePointer.isDown;
                        if (this.tool.type === ToolType.DRAW) {
                            const [firstgid, type] = activeWall.split('-').map((s) => parseInt(s, 10));

                            this.preview.setBounds(
                                { x: -32 * (type), y: 0, width: 32 * (type + 1), height: 32 }
                            );

                            if (isDown) {
                                if (this.wallManager.place(firstgid, type, tileX, tileY)) {
                                    // Destroy objects
                                    const { x, y, width, height } = this.preview.body,
                                    crushed = this.physics.overlapRect(
                                        x + 1, y + 1 - 32, width - 2, height - 2 + 32, true, true);
                                    crushed.forEach((body) => body != this.preview.body && body.gameObject.destroy());
                                    return true;
                                }
                            }
                            return this.wallManager.checkPlace(type, tileX, tileY);

                        } else if (this.tool.type === ToolType.ERASE) {
                            if (isDown) {
                                return this.wallManager.remove(tileX, tileY);
                            }
                            return this.wallManager.checkRemove(tileX, tileY);
                        }
                        return false;
                    }

                    let activeGid, tint = 0xffffff;
                    if (activeTile && activeTile[0] === 'C') {
                        if (activeLayerName != '__Conference') {
                            this.preview.setTexture('__DEFAULT');
                            return false;
                        }
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

                    this.preview.setTint(tint);
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
                                    !this.save && useWorldEditorStore.getState().setState({ save: true });
                                    activeLayer.fill(activeGid, tileX, tileY, 1, 1);
                                    clickedTile && (clickedTile.tint = tint);

                                    this.flag && this.wallManager.place(16, 0, tileX, tileY);
                                    !this.flag && this.wallManager.remove(tileX, tileY);
                                }
                                return true;
                            }
                            break;
                        case ToolType.ERASE:
                            if (isDown) {
                                !this.save && useWorldEditorStore.getState().setState({ save: true });
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
                                    !this.save && useWorldEditorStore.getState().setState({ save: true });
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

                    const pointerX = Math.Snap.Floor(worldPoint.x, 16),
                        pointerY = Math.Snap.Floor(worldPoint.y, 16);

                    const activeObject = useWorldEditorStore.getState().active.object;

                    this.preview.setPosition(pointerX + 16, pointerY + 16)
                        .setTint(0xffffff);

                    const { x, y, width, height } = this.preview.body,
                        // Check collision with objects
                        hovered = this.physics.overlapRect(
                            x + 1, y + 1, width - 2, height - 2, true, true);

                    switch (this.tool.type) {
                        case ToolType.DRAW:
                            this.preview.setTexture(activeObject || '__DEFAULT');

                            if (activeObject) {
                                const body = this.mapManager.objectProps[activeObject].body,
                                    onWall = this.mapManager.objectProps[activeObject].properties?.onWall;

                                this.preview.setBounds(body);

                                // Check object on world bounds
                                if (x < 0 || this.map.widthInPixels < x + width || y < 0 || this.map.heightInPixels < y + height)
                                    return false;

                                // Check collision with collidable tiles
                                for (let i = x; i < x + width; i += 16)
                                    for (let j = y; j < y + height; j += 16) {
                                        this.flag && console.log(i, j)
                                        const tile = this.map.getLayer('__Collision').tilemapLayer.getTileAtWorldXY(i, j, false);
                                        if (tile && !onWall) {
                                            return false;
                                        }
                                        if (!tile && onWall) {
                                            return false;
                                        }
                                    }

                                if (hovered.length < 2) {
                                    if (this.input.manager.activePointer.isDown) {
                                        if (this.mouseClick) {
                                            !this.save && useWorldEditorStore.getState().setState({ save: true });
                                            const obj = this.add.sprite(this.preview.x, this.preview.y, activeObject),
                                                properties = this.mapManager.objectProps[activeObject].properties;
                                            if (properties) {
                                                obj.setData(properties);
                                            }
                                            activeObjectGroup.add(obj);
                                            const { width, height, offset } = this.preview.body;
                                            obj.body.setSize(width, height)
                                                .setOffset(
                                                    offset.x + this.preview.getSprite().width / 2,
                                                    offset.y + this.preview.getSprite().height / 2);
                                            obj.setDepth(this.preview.y + obj.height / 2);
                                            this.mouseClick = false;
                                        }
                                    } else {
                                        this.mouseClick = true;
                                    }
                                    return true;
                                }
                            } else {
                                this.preview.setBounds();
                            }
                            break;
                        case ToolType.ERASE:
                            this.preview.setTexture('__DEFAULT').setBounds();

                            if (hovered.length > 1) {
                                if (this.input.manager.activePointer.isDown) {
                                    hovered.forEach((body) => body != this.preview.body && body.gameObject.destroy());
                                }
                            }
                            return true;
                        case ToolType.PICK:
                        case ToolType.FILL:
                        case ToolType.SELECT:
                            this.preview.setTexture('__DEFAULT').setBounds();
                            break;
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
    tint = 0xffffff;

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

    setTint(tint) {
        this.tint = tint;
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
        this.getSprite().setTint((this.tint + 0xff0000) % 0xffffff);
        return this;
    }

    setValid() {
        this.getRectangle().setStrokeStyle(2, 0x0000ff);
        this.getSprite().setTint(this.tint);
        return this;
    }
}

export default WorldEditorScene;
