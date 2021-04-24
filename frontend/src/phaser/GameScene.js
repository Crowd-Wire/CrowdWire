import * as Phaser from 'phaser';

import { getSocket } from "services/socket";

import usePlayerStore from "stores/usePlayerStore.ts";

var ws = getSocket('1');

const sceneConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};

var globalVar = false;



class GameScene extends Phaser.Scene {
    playerSprites = {};
    inRangePlayers = new Set();
    count = 0;

    constructor() {
        super(sceneConfig);
    }

    create() {

        this.add.text(50, 70, "Key D to change scene.")
        this.text = this.add.text(50, 50, `${this.count}`)

        this.map = this.add.tilemap('map');
        let tiles = this.map.addTilesetImage('wall-tiles', 'tiles');

        let ground = this.map.createLayer('Ground', tiles, 0, 0);
        this.obstacles = this.map.createLayer('Objects', tiles, 0, 0);

        // -1 makes all tiles on this layer collidable
        this.obstacles.setCollisionByExclusion([-1]);

        // create the map borders
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;

        // listen to the arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();


        // static players for range test
        new OnlinePlayerSprite(this, 0, 500);
        new OnlinePlayerSprite(this, 500, 600);

        // main player
        this.player = new PlayerSprite(this, 50, 50);
        // connect to room
        ws.joinRoom('1', {x: 50, y: 50});

        // make camera follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true;   // prevent tiles bleeding (showing border lines on tiles)

        this.physics.add.collider(this.player, this.obstacles);

        this.input.keyboard.on('keydown-D', () => {
            this.scene.start('FillTilesScene');
        }, this);
        this.input.keyboard.on('keydown-Q', () => {
            globalVar = !globalVar;
        }, this);
        
        this.unsubscribe = usePlayerStore.subscribe(this.handlePlayerConnection, state => Object.keys(state.players));

        this.physics.add.collider(Object.values(this.playerSprites), this.obstacles);

        console.log(this.obstacles)
    }

    handlePlayerConnection = (players, prevPlayers) => {
        const storePlayers = usePlayerStore.getState().players;
        
        if (players.length > prevPlayers.length) {
            // connection
            for (const id of players) {
                if (!(id in this.playerSprites)) {
                    let position = usePlayerStore.getState().players[id].position;
                    this.playerSprites[id] = new OnlinePlayerSprite(this, position.x, position.y, id);
                    this.physics.add.collider(this.playerSprites[id], this.obstacles);
                }
            }
        } else {
            // disconnection
            for (const id of prevPlayers) {
                if (!(id in storePlayers)) {
                    this.playerSprites[id].disconnect();
                    delete this.playerSprites[id];
                }
            }
        }
    }

    update(time, delta) {
        this.player.updateMovement();

        if (!globalVar)
            return;

        // detect surrounding players
        var bodies = this.physics.overlapCirc(this.player.body.x, this.player.body.y, 150, true, true)
        // console.log(bodies.length - 1, this.inRangePlayers.size)
        if (bodies.length - 1 != this.inRangePlayers.size) {
            const rangePlayers = bodies.filter((b) => b.gameObject instanceof OnlinePlayerSprite)
                                    .map((b) => b.gameObject.id);
            if (rangePlayers.length > this.inRangePlayers.size) {
                // wire players
                ws.wirePlayer('1', 
                    rangePlayers.filter((id) => {
                        const entered = !this.inRangePlayers.has(id);
                        if (entered) this.inRangePlayers.add(id);
                        return entered;
                    })
                );
            } else {
                // unwire players
                ws.unwirePlayer('1', 
                    this.inRangePlayers.filter((id) => {
                        const left = !(id in rangePlayers);
                        if (left) this.inRangePlayers.delete(id);
                        return left;
                    })
                );
            }
        } else if (bodies.length > 1) {
            this.player.body.debugBodyColor = 0x0099ff; // blue
        } else {
            this.player.body.debugBodyColor = 0xff9900; // orange
        }
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
class PlayerSprite extends Phaser.Physics.Arcade.Sprite {
    speed = 500;
    step = 0;
    lastVelocity;

    constructor(scene, x, y) {
        super(scene, x, y, 'player', 6);

        // add sprite to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // set some default physics properties
        this.setScale(3);
        this.setCollideWorldBounds(true);

        this.body.onWorldBounds = true; // not sure if this is important

        this.anims.create({
            key: 'horizontal',
            frames: this.anims.generateFrameNumbers('player', { frames: [1, 7, 1, 13]}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { frames: [2, 8, 2, 14]}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { frames: [ 0, 6, 0, 12 ] }),
            frameRate: 10,
            repeat: -1
        });
    }

    updateMovement() {
        const direction = new Phaser.Math.Vector2();

        this.body.setVelocity(0);

        // get resultant direction
        if (this.scene.cursors.left.isDown)
            direction.x += -1;
        if (this.scene.cursors.right.isDown)
            direction.x += 1;
        if (this.scene.cursors.up.isDown)
            direction.y += -1;
        if (this.scene.cursors.down.isDown)
            direction.y += 1;

        // set normalized velocity (player doesn't move faster on diagonals)
        this.body.setVelocityX(direction.x * this.speed);
        this.body.setVelocityY(direction.y * this.speed);
        this.body.velocity.normalize().scale(this.speed);

        this.updateAnimation();

        if (this.step == 1 && !this.body.speed) {
            ws.sendMovement('1', this.body.center, this.body.velocity);
            this.step = 0;
        } else if (!this.lastVelocity || !this.body.velocity.equals(this.lastVelocity)) {
            ws.sendMovement('1', this.body.center.subtract(this.body.newVelocity), this.body.velocity);
            this.lastVelocity = this.body.velocity.clone();
            this.step = 1;
        }
    }

    updateAnimation(velocity) {
        if (!velocity)
            velocity = this.body.velocity;
        
        if (velocity.y < 0) {
            this.anims.play('up', true);
        }
        else if (velocity.y > 0) {
            this.anims.play('down', true);
        }
        else if (velocity.x < 0) {
            this.flipX = true;
            this.anims.play('horizontal', true);
        }
        else if (velocity.x > 0) {
            this.flipX = false;
            this.anims.play('horizontal', true);
        } else {
            this.anims.stop();
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
class OnlinePlayerSprite extends PlayerSprite {
    speed = 500; // 900 is the upperbound ig
    numUpdates = 0;
    wasBlocked = false;
    
    constructor(scene, x, y, id) {
        super(scene, x, y);

        if (id)
            this.unsubscribe = usePlayerStore.subscribe(
                this.handlePlayerMovement, state => state.players[this.id]);

        this.id = id ? id : '-1'; // TODO: remove after testing
    }

    handlePlayerMovement = ({position, velocity}) => {
        this.updateAnimation(velocity);
        this.body.reset(position.x, position.y);
        this.body.setVelocity(velocity.x, velocity.y);
        console.log(velocity)
    }

    /**
     * Destroys the object cleanly.
     */
    disconnect() {
        this.unsubscribe();
        this.destroy();
    }
}

export default GameScene;