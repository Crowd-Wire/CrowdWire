import * as Phaser from 'phaser';

import { getSocket } from "services/socket";


var socket = getSocket();

const sceneConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};


class GameScene extends Phaser.Scene {
    flag = 0;
    PLAYER_NUM = 10;

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

        /* create the map borders */
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;

        // listen to the arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();


        /* static player for range test */
        new OnlinePlayerSprite(this, 100, 250);
        new OnlinePlayerSprite(this, 500, 600);

        /* players for follow test */
        this.otherPlayers = [];
        for (let i = 0; i < this.PLAYER_NUM; i++) {
            this.otherPlayers[i] = new OnlinePlayerSprite(this, 50, 60);
            this.otherPlayers[i].alpha = (i+1)/this.PLAYER_NUM;
        }

        // main player
        this.player = new PlayerSprite(this, 50, 60);

        
        /* make camera follow player */
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true;   // prevent tiles bleeding (showing border lines on tiles)

        this.physics.add.collider(this.player, obstacles);

        this.input.keyboard.on('keydown-D', () => {
            this.scene.start('FillTilesScene');
        }, this);
    }

    update(time, delta) {
        this.flag++;
        this.player.updateMovement();

        /* detect surrounding players */
        var bodies = this.physics.overlapCirc(this.player.body.x, this.player.body.y, 150, true, true)
        if (bodies.length > 1) {
            this.player.body.debugBodyColor = 0x0099ff; // blue

            if (socket.readyState === WebSocket.OPEN) {
                console.log('sending proximity to', bodies[0].gameObject.id)
                socket.send(JSON.stringify(bodies[0].gameObject.id));
            }
        } else {
            this.player.body.debugBodyColor = 0xff9900; // orange
        }

        /* follow player test */
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

        if (direction.x || direction.y) 
            if (socket.readyState === WebSocket.OPEN) {
                console.log('sending velocity', this.body.velocity)
                socket.send(JSON.stringify(this.body.velocity));
            }
    }

    updateAnimation(direction) {
        if (direction.y > 0) {
            this.anims.play('down', true);
        }
        else if (direction.y < 0) {
            this.anims.play('up', true);
        }
        else if (direction.x > 0) {
            this.flipX = false;
            this.anims.play('horizontal', true);
        }
        else if (direction.x < 0) {
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
    static id = 0;
    speed = 500; // 900 is the upperbound ig
    
    constructor(scene, x, y) {
        super(scene, x, y);
        this.id = OnlinePlayerSprite.id++;
    }

    updateMovementByPosition(position, flag) {
        // simulate delay
        if (flag % 6 != 0)
            return;

        var distance = Phaser.Math.Distance.Between(this.x, this.y, position.x, position.y);

        //  4 is our distance tolerance, i.e. how close the source can get to the target
        //  before it is considered as being there. The faster it moves, the more tolerance is required.
        // console.log(distance,  this.speed * 2/100)
        if (distance < this.speed * 2/100)
        {
            this.body.reset(position.x, position.y);
            this.anims.stop();
            return;
        }

        let direction;
        direction = {x: position.x - this.x, y: position.y - this.y};

        this.updateAnimation(direction);

        // this.setPosition(position.x, position.y);
        this.scene.physics.moveToObject(this, position, this.speed);
    }

    updateMovementByDirection(direction) {
        this.updateAnimation(direction);

        this.body.setVelocityX(direction.x * this.speed);
        this.body.setVelocityY(direction.y * this.speed);
        this.body.velocity.normalize().scale(this.speed);
    }
}

export default GameScene;