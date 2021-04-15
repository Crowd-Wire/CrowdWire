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
        
        this.onlinePlayers = {};

        this.unsubscribe = usePlayerStore.subscribe(this.handlePlayerConnection, state => Object.keys(state.players));

        this.physics.add.collider(Object.values(this.onlinePlayers), this.obstacles);
        
    }

    handlePlayerConnection = (players, prevPlayers) => {
        const storePlayers = usePlayerStore.getState().players;
        
        if (players.length > prevPlayers.length) {
            // connection
            for (const id of players) {
                if (!(id in this.playerSprites)) {
                    let position = usePlayerStore.getState().players[id].position;
                    this.playerSprites[id] = new OnlinePlayerSprite(this, position.x, position.y, id);
                }
            }
        } else {
            // disconnection
            for (const id of prevPlayers) {
                if (!(id in storePlayers)) {
                    this.playerSprites[id].destroy();
                    delete  this.playerSprites[id];
                }
            }
        }
    }


    update(time, delta) {
        this.player.updateMovement();

        // detect surrounding players
        var bodies = this.physics.overlapCirc(this.player.body.x, this.player.body.y, 150, true, true)
        if (bodies.length > 1) {
            this.player.body.debugBodyColor = 0x0099ff; // blue

            // if (ws.socket.readyState === WebSocket.OPEN) {
            //     ws.socket.send(JSON.stringify(bodies[0].gameObject.id));
            // }
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
    stopped = true;

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

        // send movement one more time after stopping
        if (!this.stopped || this.body.speed)
            ws.sendMovement('1', this.body.center, this.body.velocity);
        this.stopped = this.body.speed === 0;
        
    }

    updateAnimation() {
        if (this.body.speed === 0) {
            this.anims.stop();
        }
        else if (this.body.velocity.y < 0) {
            this.anims.play('up', true);
        }
        else if (this.body.velocity.y > 0) {
            this.anims.play('down', true);
        }
        else if (this.body.velocity.x < 0) {
            this.flipX = true;
            this.anims.play('horizontal', true);
        }
        else if (this.body.velocity.x > 0) {
            this.flipX = false;
            this.anims.play('horizontal', true);
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
    
    constructor(scene, x, y, id) {
        super(scene, x, y);
        this.id = id;

        if (this.id)
            this.unsubscribe = usePlayerStore.subscribe(
                this.handlePlayerMovement, state => state.players[this.id]);
    }

    handlePlayerMovement = ({position, velocity}) => {
        console.log(position, velocity);
        if (this.numUpdates++ > 15) {
            this.body.reset(position.x, position.y);
            this.numUpdates = 0;
        }
        this.updateMovement(velocity);
    }

    /**
     * Destroys the object cleanly.
     */
    destroy = () => {
        this.unsubscribe();
        this.body.destroy();
    }

    updateMovement(velocity) {
        this.body.setVelocityX(velocity.x * this.speed);
        this.body.setVelocityY(velocity.y * this.speed);
        this.body.velocity.normalize().scale(this.speed);

        this.updateAnimation();
    }
}

export default GameScene;