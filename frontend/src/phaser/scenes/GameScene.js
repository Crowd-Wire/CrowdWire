import Phaser, { GameObjects } from 'phaser';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';

import { getSocket } from "services/socket";

import usePlayerStore from "stores/usePlayerStore.ts";

import { useConsumerStore } from "webrtc/stores/useConsumerStore";
import useWorldUserStore from "stores/useWorldUserStore";
import MapManager from '../MapManager';
import { isDesktop } from 'utils/isDesktop';

const sceneConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};

var globalVar = true;


class GameScene extends Phaser.Scene {
    static inRangePlayers = new Set();

    remotePlayers = {};
    ws = getSocket(useWorldUserStore.getState().world_user.world_id);

    constructor() {
        super(sceneConfig);
        this.subscriptions = [];
    }

    create() {
        const mapManager = new MapManager();

        this.map = mapManager.buildMap(this);

        this.map.layers.forEach((layer) => {
            if (layer.name.startsWith('__Conference'))
                this.roomLayer = layer.tilemapLayer.setVisible(false);
            else if (layer.name.includes("Collision"))
                // -1 makes all tiles on this layer collidable
                this.collisionLayer = layer.tilemapLayer.setCollisionByExclusion([-1]);
            else if (layer.name === "__Float")
                layer.tilemapLayer.setDepth(this.map.heightInPixels);
            else if (layer.name === "Float")
                layer.tilemapLayer.setDepth(this.map.heightInPixels + 1);
        })

        this.objectGroups = mapManager.buildObjects(this);

        this.selectedObject = this.add.sprite(0, 0, '__DEFAULT')
            .setScale(1.1)
            .setOrigin(0.5)
            .setTintFill(0xffff00)
            .setVisible(false);
        this.interact = null;
        this.interactObject = null;
        
        // main player
        let last_pos = useWorldUserStore.getState().world_user.last_pos;
        if (Object.keys(last_pos).length !== 0) {
            this.player = new Player(this, last_pos.x, last_pos.y);
        } else {
            this.player = new Player(this, 50, 50);
        }

        // create the map borders
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;

        // listen to the arrow keys
        // this.cursors = this.input.keyboard.createCursorKeys();
        if (isDesktop()) {
            this.cursors = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                up2: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                interact: Phaser.Input.Keyboard.KeyCodes.X,
            }, false);
        } else {

            const joystick = new VirtualJoystick(this, {
                x: this.game.canvas.width*0.75 - 50, 
                y: this.game.canvas.height*0.75 - 50,
                base: this.add.circle(0, 0, 50, 0x0B132B, 0.6).setDepth(1100),
                thumb: this.add.circle(0, 0, 25, 0x000000, 0.8).setDepth(1100),
                // dir: '8dir',
                // forceMin: 16,
                // fixed: true,
                // enable: true
            }).setScrollFactor(0);

            this.cursors = joystick.createCursorKeys();

            window.addEventListener('resize', () => {
                joystick.setPosition(this.game.canvas.width*0.75 - 50, this.game.canvas.height*0.75 - 50);
            }) ;
        }
        this.game.input.events.on('reset', () => { this.input.keyboard.resetKeys() });

        // connect to room
        if (Object.keys(last_pos).length !== 0) {
            this.ws.joinPlayer({ x: last_pos.x, y: last_pos.y });
        } else {
            this.ws.joinPlayer({ x: 50, y: 50 });
        }

        // make camera follow player
        this.cameras.main
            .startFollow(this.player)
            .setBackgroundColor("#0C1117")
            .setZoom(1.5);
        this.cameras.main.roundPixels = true;   // prevent tiles bleeding (showing border lines on tiles)


        this.input.keyboard.on('keydown-Q', () => {
            globalVar = !globalVar;
        }, this);

        Object.entries(usePlayerStore.getState().players).forEach(([id, player]) => {
            const position = player.position;
            this.remotePlayers[id] = new RemotePlayer(this, position.x, position.y, id);
        })
        this.subscriptions.push(
            usePlayerStore.subscribe(this.handlePlayerConnection, state => Object.keys(state.players)));

        // TODO: remove after testing
        // this.subscriptions.push(
        //     usePlayerStore.subscribe(this.handleGroups, state => ({ ...state.groups })));

        this.game.input.events.on('unsubscribe', () => {
            this.subscriptions.forEach((unsub) => unsub());
        });
    }

    // TODO: remove after tests
    // allows devs to see in frontend the groups assigned to the users
    teste_player_id;
    handleGroups = (groups) => {
        for (const [id, grps] of Object.entries(groups)) {
            if (id in this.remotePlayers) {
                let text = this.remotePlayers[id].getText();
                text.setText([text.text.split('\n')[0], grps.join(', ')]);
            } else {
                // own player
                this.teste_player_id = id;
                let text = this.player.getText();
                text.setText([text.text.split('\n')[0], grps.join(', ')]);
            }
        }
    }

    handlePlayerConnection = (players, prevPlayers) => {
        const storePlayers = usePlayerStore.getState().players;
        if (players.length > prevPlayers.length) {
            // connection
            for (const id of players) {
                if (!(id in this.remotePlayers)) {
                    const position = usePlayerStore.getState().players[id].position;
                    this.remotePlayers[id] = new RemotePlayer(this, position.x, position.y, id);
                }
            }
        } else {
            // disconnection
            for (const id of prevPlayers) {
                if (!(id in storePlayers)) {
                    if (this.remotePlayers[id]) {
                        this.remotePlayers[id].destroy();
                        delete this.remotePlayers[id];
                    }
                }
            }
        }
    }

    updateConferences = () => {
        if (this.roomLayer) {
            const tile = this.roomLayer.getTileAtWorldXY(this.player.body.center.x, this.player.body.center.y);
            if (tile) {
                const conferenceId = tile.properties.conference;
                if (useWorldUserStore.getState().world_user.in_conference != conferenceId) {
                    useWorldUserStore.getState().updateConference(conferenceId);
                    GameScene.inRangePlayers = new Set();
                    this.player.ws.joinConference(conferenceId + '-' + useWorldUserStore.getState().world_user.world_id);
                }
            }
            else {
                if (useWorldUserStore.getState().world_user.in_conference) {
                    const conferenceId = useWorldUserStore.getState().world_user.in_conference;
                    useConsumerStore.getState().closeRoom(conferenceId);
                    useWorldUserStore.getState().updateConference(null);
                    this.player.ws.leaveConference(conferenceId + '-' + useWorldUserStore.getState().world_user.world_id);
                }
            }
        }
    }

    updateInteractables = () => {
        const playerPos = this.player.body.center,
            bodies = this.physics
                .overlapCirc(playerPos.x, playerPos.y, 50, true, true)
                .filter((b) => b.gameObject instanceof GameObjects.Sprite && b.gameObject.data?.list.interact);
        if (bodies.length) {
            const closestBody = bodies.reduce((prev, curr) => {
                return Math.hypot(playerPos.x - prev.center.x, playerPos.y - prev.center.y)
                    < Math.hypot(playerPos.x - curr.center.x, playerPos.y - curr.center.y) ?
                    prev : curr;
            });
            const { x, y, width, height, depth } = closestBody.gameObject;
            this.selectedObject.setTexture(closestBody.gameObject.texture)
                .setPosition(x, y)
                .setSize(width, height)
                .setVisible(true)
                .setDepth(depth - 1);
            this.interact = closestBody.gameObject.data.list.interact;
            this.interactObject = closestBody.gameObject;
        } else {
            this.selectedObject.setVisible(false);
            this.interact = null;
            this.interactObject = null;
        }
    }

    updateInteract() {
        const callService = () => {
            if (this.interact === 'FILE_SHARE') {
                useWorldUserStore.getState().setShowFileSharing();
            } else if (this.interact === 'SCREEN_SHARE') {
                useWorldUserStore.getState().setShowMediaOffState(false);
            } else if (this.interact === 'WHITEBOARD') {
                useWorldUserStore.getState().setShowIFrame('https://r7.whiteboardfox.com/');
            } else if (this.interact === 'CHESS') {
                useWorldUserStore.getState().setShowIFrame('https://www.chesshotel.com/pt/');
            } else if (this.interact === 'MATH_GAMES') {
                useWorldUserStore.getState().setShowIFrame('http://138.68.191.32/');
            } else if (this.interact === 'CROSS_WORDS') {
                useWorldUserStore.getState().setShowIFrame('https://downforacross.com/');
            } else if (this.interact === 'SURVIVAL') {
                useWorldUserStore.getState().setShowIFrame('https://www.gameflare.com/embed/mini-survival/');
            }
        };
        if (this.cursors.interact?.isDown) {
            callService();
        }
        if (this.interactObject && this.input.manager.activePointer.isDown) {
            let { x, y, width, height } = this.interactObject,
                worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
            x -= width/2;
            y -= height/2;

            if (x < worldPoint.x && worldPoint.x < x + width && y < worldPoint.y && worldPoint.y < y + height) {
                callService();
            }
        }
    }

    updateRangePlayers = () => {
        if (useWorldUserStore.getState().world_user.in_conference == null) {
            // Detect surrounding players
            const bodies = this.physics
                .overlapCirc(this.player.body.center.x, this.player.body.center.y, 150)
                .filter((b) => b.gameObject instanceof RemotePlayer);
            if (bodies.length != GameScene.inRangePlayers.size) {
                const rangePlayers = bodies.map((b) => b.gameObject.id);
                if (rangePlayers.length > GameScene.inRangePlayers.size) {
                    // Wire players
                    this.ws.wirePlayer(
                        rangePlayers.filter((id) => {
                            const entered = !GameScene.inRangePlayers.has(id);
                            if (entered) GameScene.inRangePlayers.add(id);
                            return entered;
                        })
                    );
                } else if (rangePlayers.length < GameScene.inRangePlayers.size) {
                    // Unwire players
                    this.ws.unwirePlayer(
                        [...GameScene.inRangePlayers].filter((id) => {
                            const left = !rangePlayers.includes(id);
                            if (left) {
                                GameScene.inRangePlayers.delete(id);
                                // Close media connections to this user
                                useConsumerStore.getState().closePeer(id);
                            }
                            return left;
                        })
                    );
                }
            }
        }
    }

    updateDepth() {
        this.player.depth = this.player.body.y;
        Object.values(this.remotePlayers).forEach((player) => {
            player.depth = player.body.y;
        });
    }

    update(time, delta) {
        this.player.update();
        this.updateDepth();
        this.updateRangePlayers();
        this.updateInteract();
    }
}


/**
 * The player sprite from the local user.
 * Listens to the arrow keys to move.
 * 
 * @constructor
 * @param {Phaser.Scene} scene - The scene that has the sprite.
 * @param {number} x - The start horizontal position in the scene.
 * @param {number} y - The start vertical position in the scene.
 */
class Player extends Phaser.GameObjects.Container {
    speed = 200;  // 900 is the upperbound ig
    step = 0;
    lastVelocity;
    ws = getSocket(useWorldUserStore.getState().world_user.world_id);

    constructor(scene, x, y, user_id=null) {
        super(scene, x, y);

        // add container to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.add.collider(this, [scene.collisionLayer, scene.objectGroups['ObjectCollision']]);
        
        let avatar_chosen_sprite = "avatars_1_1"

        if (user_id == null) {
            avatar_chosen_sprite = useWorldUserStore.getState().world_user.avatar
        } else {
            avatar_chosen_sprite = usePlayerStore.getState().users_info[user_id]?.avatar
        }
        let avatar_chosen = avatar_chosen_sprite.split('_')
        const avatar_sprite_sheet = avatar_chosen[0] + "_" + avatar_chosen[1]
        const avatar_number = avatar_chosen[2]

        const col = 3*(avatar_number-1)%12
        const row = (avatar_number === '1' || avatar_number === '2' || avatar_number === '3' || avatar_number === '4') ?
                            0
                        :   4 * 12

        // add sprite and text to scene and then container
        const sprite = scene.add.sprite(0, 0, avatar_sprite_sheet, 1 + col + row)
            .setOrigin(0.5)
            .setScale(0.8);
        const text = scene.add.bitmapText(0, -32, 'atari', '', 16)
            .setOrigin(0.5)
            .setCenterAlign()
            .setText([
                "Me",
                '',
            ]);

        this.addSprite(sprite)
            .addText(text);

        this.body.setSize(26, 10)
            .setOffset(-14, 10);

        // set some default physics properties
        this.body.setCollideWorldBounds(true);

        this.body.onWorldBounds = true; // not sure if this is important
        
        this.getSprite().anims.create({
            key: 'down',
            frames: this.getSprite().anims.generateFrameNumbers(avatar_sprite_sheet, { frames: [col + row, 1 + col + row, 2 + col + row] }),
            frameRate: 10,
            repeat: -1
        });
        this.getSprite().anims.create({
            key: 'left',
            frames: this.getSprite().anims.generateFrameNumbers(avatar_sprite_sheet, { frames: [col + row+12, 1 + col + row+12, 2 + col + row+12] }),
            frameRate: 10,
            repeat: -1
        });
        this.getSprite().anims.create({
            key: 'right',
            frames: this.getSprite().anims.generateFrameNumbers(avatar_sprite_sheet, { frames: [col + row+24, 1 + col + row+24, 2 + col + row+24] }),
            frameRate: 10,
            repeat: -1
        });
        this.getSprite().anims.create({
            key: 'up',
            frames: this.getSprite().anims.generateFrameNumbers(avatar_sprite_sheet, { frames: [col + row+36, 1 + col + row+36, 2 + col + row+36] }),
            frameRate: 10,
            repeat: -1
        });
    }

    addSprite(sprite) {
        return this.addAt(sprite, 0);
    }

    getSprite() {
        return this.getAt(0);
    }

    addText(text) {
        return this.addAt(text, 1);
    }

    getText() {
        return this.getAt(1);
    }

    update() {
        this.updateMovement();
        this.updateAnimation();
    }

    updateMovement() {
        const direction = new Phaser.Math.Vector2();

        this.body.setVelocity(0);

        // get resultant direction
        if (this.scene.cursors.left.isDown || this.scene.cursors.left2?.isDown)
            direction.x += -1;
        if (this.scene.cursors.right.isDown || this.scene.cursors.right2?.isDown)
            direction.x += 1;
        if (this.scene.cursors.up.isDown || this.scene.cursors.up2?.isDown)
            direction.y += -1;
        if (this.scene.cursors.down.isDown || this.scene.cursors.down2?.isDown)
            direction.y += 1;

        // set normalized velocity (player doesn't move faster on diagonals)
        this.body.setVelocityX(direction.x * this.speed);
        this.body.setVelocityY(direction.y * this.speed);
        this.body.velocity.normalize().scale(this.speed);

        if (!this.lastVelocity || !this.body.velocity.equals(this.lastVelocity)) {
            this.ws.sendMovement(this.body.position.clone().subtract(this.body.offset), this.body.velocity);
            this.lastVelocity = this.body.velocity.clone();
            this.scene.updateConferences();
            this.scene.updateInteractables();
        }
    }

    updateAnimation(velocity) {
        if (!velocity)
            velocity = this.body.velocity;

        if (velocity.y < 0) {
            this.getSprite().anims.play('up', true);
        }
        else if (velocity.y > 0) {
            this.getSprite().anims.play('down', true);
        }
        else if (velocity.x < 0) {
            this.getSprite().anims.play('left', true);
        }
        else if (velocity.x > 0) {
            this.getSprite().anims.play('right', true);
        } else {
            this.getSprite().anims.stop();
        }
    }
}


/**
 * The player sprite from remote users.
 * Receives new directions to update its movement.
 * 
 * @constructor
 * @param {Phaser.Scene} scene - The scene that has the sprite.
 * @param {number} x - The start horizontal position in the scene.
 * @param {number} y - The start vertical position in the scene.
 */
class RemotePlayer extends Player {
    numUpdates = 0;

    constructor(scene, x, y, id) {
        super(scene, x, y, id);
        this.id = id;
        this.username = id;
        if (id in usePlayerStore.getState().users_info)
            this.username = usePlayerStore.getState().users_info[id]?.username
        this.getText().setText([
            `${this.username}`,
            // 'G???',
        ]);

        this.unsubscribe = usePlayerStore.subscribe(
            this.updateMovement, state => state.players);
    }

    updateMovement = (players) => {
        if (players && players[this.id]) {
            let position = players[this.id].position;
            let velocity = players[this.id].velocity;
            this.updateAnimation(velocity);
            this.body.reset(position.x, position.y);
            this.body.setVelocity(velocity.x, velocity.y);
        }
    }

    /**
     * Destroys the object cleanly.
     */
    destroy() {
        this.unsubscribe();
        super.destroy();
    }
}

export default GameScene;
