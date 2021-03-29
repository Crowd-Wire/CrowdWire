import * as Phaser from 'phaser';

import logoImg from '../assets/logo.png';


const sceneConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};

class GameScene extends Phaser.Scene {
    flag = 0;
    
    constructor() {
        super(sceneConfig);
    }

    preload() {
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

        this.otherPlayers = [];
        for (let i = 0; i < 32; i++) {
            this.otherPlayers[i] = new OnlinePlayerSprite(this, 50, 60);
            this.otherPlayers[i].alpha = (i+1)/32;
        }
        this.player = new PlayerSprite(this, 50, 60);

        // create the map borders
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;

        this.cursors = this.input.keyboard.createCursorKeys();

        // make camera follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true;   // prevent tiles bleeding (showing border lines on tiles)


        this.physics.add.collider(this.player, obstacles);


        this.input.keyboard.on('keydown-D', () => {
            // this.cameras.resetAll();
            // this.scene.transition({ target: 'FillTilesScene', duration: 2000 });
            this.scene.start('FillTilesScene');
        }, this);


        
    }

    update(time, delta) {
        this.flag++;
        this.player.updateMovement();
        
        this.otherPlayers[31].updateMovement({x: this.player.x, y: this.player.y}, this.flag)
        for (let i=30; i >= 0; i--) {
            this.otherPlayers[i].updateMovement({x: this.otherPlayers[i+1].x, y: this.otherPlayers[i+1].y}, this.flag)
        }
    }

}


/**
 * Something
 */
class PlayerSprite extends Phaser.Physics.Arcade.Sprite {
    speed = 500;

    constructor(scene, x, y)
    {
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

        // set animation
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

        // set normalized velocity (player doesn't move faster on diagonals)
        this.body.setVelocityX(direction.x * this.speed);
        this.body.setVelocityY(direction.y * this.speed);
        this.body.velocity.normalize().scale(this.speed);
    }
}


class OnlinePlayerSprite extends PlayerSprite {
    speed = 500; // 900 is the upperbound ig

    constructor(scene, x, y) {
        super(scene, x, y);

    }

    updateMovement(position, flag) {

        // simulate delay
        if (flag % 6 != 0) {
            return;
        }

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

        // set animation
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
            return;
        }
        // this.setPosition(position.x, position.y);
        this.scene.physics.moveToObject(this, position, this.speed);

    }
}

export default GameScene;