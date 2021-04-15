import * as Phaser from 'phaser';

import { useSelector } from "react-redux";
import { getSocket } from "services/socket";
import store from "redux/playerStore";


var ws = getSocket(1);

const sceneConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};

var globalVar = false;


class GameScene extends Phaser.Scene {
    players = {};

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
        ws.joinRoom(1, {x: 50, y: 50});

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
        this.unsubscribe = store.subscribe(this.handleJoinNLeavePlayer);
        
        this.physics.add.collider(Object.values(this.onlinePlayers), this.obstacles);
        
    }
    
    handleJoinNLeavePlayer = () => {
        
        let previousPlayers = this.players;
        console.log('handleJoinNLeavePlayer 1 ',previousPlayers, this.players, JSON.stringify(previousPlayers), JSON.stringify(this.players) )
        
        this.players = store.getState().players;
        console.log('handleJoinNLeavePlayer 1.2 ',previousPlayers, this.players, JSON.stringify(previousPlayers), JSON.stringify(this.players) )

        
        let previousPlayersIds = Object.keys(previousPlayers);
        let playersIds = Object.keys(this.players);

        console.log('handleJoinNLeavePlayer 2 ',previousPlayersIds, playersIds )

        if (previousPlayersIds.length !== playersIds.length) {

            // players updated
            if (previousPlayersIds.length > playersIds.length) {
                // left
                console.log('left')
                previousPlayersIds.forEach(playerId => {
                    if (!(playerId in this.players)) {
                        this.onlinePlayers[playerId].destroy();
                        console.log('removed')
                    }
                });
            } else {
                // joined
                console.log('joined')
                playersIds.forEach(playerId => {
                    console.log(playerId)
                    if (!(playerId in previousPlayers)) {
                        this.onlinePlayers[playerId] = new OnlinePlayerSprite(this, 50, 50, playerId);
                        // this.physics.add.collider(this.onlinePlayers, this.obstacles);
                    }
                });
            }
        }
    }

    update(time, delta) {
        this.player.updateMovement();

        // detect surrounding players
        var bodies = this.physics.overlapCirc(this.player.body.x, this.player.body.y, 150, true, true)
        if (bodies.length > 1) {
            this.player.body.debugBodyColor = 0x0099ff; // blue

            if (ws.socket.readyState === WebSocket.OPEN) {
                // ws.socket.send(JSON.stringify(bodies[0].gameObject.id));
            }
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
            ws.sendMovement(1, this.body.velocity, this.body.center);
        this.stopped = this.body.speed === 0;
        
        if (globalVar)
        console.log((direction.x ||direction.y) ? "KEY" : "", 
            this.body.velocity,
            {x: this.body.x, y: this.body.y},
            this.body.newVelocity,
            this.body.position,
            this.body.prev,
            this.body.prevFrame,
            this.body.speed
        )

        /* body.newVelocity The Body's change in position (due to velocity) at the last step, in pixels.
            The size of this value depends on the simulation's step rate.*/

        /* body.prev The position of this Body during the previous step. */

        /* body.prevFrame The position of this Body during the previous frame. */
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
    velocity;
    player;
    numUpdates = 0;
    
    constructor(scene, x, y, id) {
        super(scene, x, y);
        this.id = id;

        if (this.id)
            this.unsubscribe = store.subscribe(this.handlePlayerMovement);
    }

    /**
     * Destroys the object cleanly.
     */
    destroy = () => {
        console.log('unsub')
        this.unsubscribe();
        this.body.destroy();
    }

    handlePlayerMovement = () => {
        let previousVelocity = this.velocity;
        console.log('handlePlayerMovement', this.id, store.getState().players[this.id])
        const player = store.getState().players[this.id];
        if (!player)
            return;
        this.velocity = player.velocity;

        if (previousVelocity !== this.velocity) {
            // velocity updated
            if (this.numUpdates++ > 15) {
                let position = player.position;
                this.body.reset(position.x, position.y);
            }
            this.updateMovementByDirection(this.velocity);
        }
    }

    updateMovementByPosition(position) {

        if (!position)
            return;

            
            var distance = Phaser.Math.Distance.Between(this.body.center.x, this.body.center.y, position.x, position.y);
            // console.log(distance)
            // if (distance < 32) {
                //     speed = distance*15;
                // }
                
                
                /* body.newVelocity The Body's change in position (due to velocity) at the last step, in pixels.
                The size of this value depends on the simulation's step rate.*/
                
                /* body.prev The position of this Body during the previous step. */
                
                /* body.prevFrame The position of this Body during the previous frame. */
                
                
                if (distance < 8)
                {
                    this.body.reset(position.x, position.y);
                    this.anims.stop();
                    return;
                }
                
            this.scene.physics.moveToObject(this, position, this.speed);

            this.updateAnimation();
    }

    updateMovementByDirection(direction) {
        this.body.setVelocityX(direction.x * this.speed);
        this.body.setVelocityY(direction.y * this.speed);
        this.body.velocity.normalize().scale(this.speed);

        this.updateAnimation();
    }
}

export default GameScene;