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


class GameScene extends Phaser.Scene {
    flag = 0;
    PLAYER_NUM = 0;
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
        let obstacles = this.map.createLayer('Objects', tiles, 0, 0);

        // -1 makes all tiles on this layer collidable
        obstacles.setCollisionByExclusion([-1]);

        // create the map borders
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;

        // listen to the arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();


        // static players for range test
        new OnlinePlayerSprite(this, 0, 0);
        new OnlinePlayerSprite(this, 500, 600);

        // players for follow test
        this.otherPlayers = [];
        for (let i = 0; i < this.PLAYER_NUM; i++) {
            this.otherPlayers[i] = new OnlinePlayerSprite(this, 50, 60);
            this.otherPlayers[i].alpha = (i+1)/this.PLAYER_NUM;
        }

        // main player
        this.player = new PlayerSprite(this, 50, 60);

        // make camera follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true;   // prevent tiles bleeding (showing border lines on tiles)

        this.physics.add.collider(this.player, obstacles);

        this.input.keyboard.on('keydown-D', () => {
            this.scene.start('FillTilesScene');
        }, this);


        this.onlinePlayers = [];
        this.unsubscribe = store.subscribe(this.handleJoinNLeavePlayer);

        this.physics.add.collider(this.onlinePlayers, obstacles);

    }

    handleJoinNLeavePlayer = () => {
        let previousPlayers = this.players;
        this.players = store.getState().players;
        
        let previousPlayersIds = Object.keys(previousPlayers);
        let playersIds = Object.keys(this.players);

        if (previousPlayersIds.length !== playersIds.length) {

            // players updated
            if (previousPlayersIds.length > playersIds.length) {
                // left
                
                previousPlayersIds.forEach(playerId => {
                    if (!(playerId in this.players))
                    return; //apagar sprite
                });
            } else {
                // joined

                playersIds.forEach(playerId => {
                    if (!(playerId in previousPlayers))
                        this.onlinePlayers.push(new OnlinePlayerSprite(this, 50, 50, playerId));
                });
            }
        }
    }

    update(time, delta) {
        this.flag++;
        this.player.updateMovement();

        this.onlinePlayers.forEach(p => {
            p.updateMovement();
        })

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

        // follow player test
        if (this.PLAYER_NUM > 0)
            this.otherPlayers[this.PLAYER_NUM-1].updateMovementByPosition({x: this.player.x, y: this.player.y}, this.flag)
        for (let i=this.PLAYER_NUM-2; i >= 0; i--) {
            this.otherPlayers[i].updateMovementByPosition({x: this.otherPlayers[i+1].x, y: this.otherPlayers[i+1].y}, this.flag)
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

        this.updateAnimation(direction);

        // set normalized velocity (player doesn't move faster on diagonals)
        this.body.setVelocityX(direction.x * this.speed);
        this.body.setVelocityY(direction.y * this.speed);
        this.body.velocity.normalize().scale(this.speed);

        // if (this.body.velocity.x || this.body.velocity.y) 
            if (ws.socket.readyState === WebSocket.OPEN) {
                ws.sendPosition(1, this.body.velocity);
            }
    }

    updateAnimation(direction) {
        if (this.body.facing == Phaser.Physics.Arcade.FACING_DOWN) {
            this.anims.play('down', true);
        }
        else if (this.body.facing == Phaser.Physics.Arcade.FACING_UP) {
            this.anims.play('up', true);
        }
        else if (this.body.facing == Phaser.Physics.Arcade.FACING_RIGHT) {
            this.flipX = false;
            this.anims.play('horizontal', true);
        }
        else if (this.body.facing == Phaser.Physics.Arcade.FACING_LEFT) {
            this.flipX = true;
            this.anims.play('horizontal', true);
        }
        else {
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
    direction;
    
    constructor(scene, x, y, id) {
        super(scene, x, y);
        this.id = id;

        this.unsubscribe = store.subscribe(this.handlePlayerMovement);
    }

    handlePlayerMovement = () => {
        let previousDirection = this.direction;
        this.direction = store.getState().players[this.id];
          
        if (previousDirection !== this.direction) {
            // direction updated

            this.updateMovementByDirection(this.direction);
        }
    }

    updateMovement() {
        // this.updateMovementByPosition(this.direction);
        // this.updateMovementByDirection(this.direction);
    }

    updateMovementByPosition(position) {

        if (!position)
            return;

        this.updateAnimation({x: position.x - this.body.center.x, y: position.y - this.body.center.y});

        var distance = Phaser.Math.Distance.Between(this.body.center.x, this.body.center.y, position.x, position.y);
        // console.log(distance)
        // if (distance < 32) {
        //     speed = distance*15;
        // }


        if (distance < 8)
        {
            this.body.reset(position.x, position.y);
            this.anims.stop();
            return;
        }

        this.scene.physics.moveToObject(this, position, this.speed);
    }

    updateMovementByDirection(direction) {
        if (!direction)
            return;
        this.updateAnimation(direction);

        this.body.setVelocityX(direction.x * this.speed);
        this.body.setVelocityY(direction.y * this.speed);
        this.body.velocity.normalize().scale(this.speed);
    }
}

export default GameScene;