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
    remotePlayers = {};
    localPlayers = {};
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
        this.localPlayers['-1'] = new LocalPlayer(this, 0, 500, '-1');
        this.localPlayers['-2'] = new LocalPlayer(this, 500, 600, '-2');
        this.localPlayers['-3'] = new LocalPlayer(this, 650, 450, '-3');

        // main player
        this.player = new Player(this, 50, 50);

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

        // TODO: remove after testing
        this.unsubscribe2 = usePlayerStore.subscribe(this.handleGroups, state => ({...state.groups}));

        this.physics.add.collider(Object.values(this.remotePlayers), this.obstacles);
    }

    handleGroups = (groups) => {
        for (const [id, grps] of Object.entries(groups)) {
            if (id in this.remotePlayers) {
                let text = this.remotePlayers[id].getText();
                text.setText([text.text.split('\n')[0], grps.join(', ')]);
            } else if (id in this.localPlayers) {
                let text = this.localPlayers[id].getText();
                text.setText([text.text.split('\n')[0],grps.join(', ')]);
            } else {
                // own player
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
                    let position = usePlayerStore.getState().players[id].position;
                    this.remotePlayers[id] = new RemotePlayer(this, position.x, position.y, id);
                    this.physics.add.collider(this.remotePlayers[id], this.obstacles);
                }
            }
        } else {
            // disconnection
            for (const id of prevPlayers) {
                if (!(id in storePlayers)) {
                    this.remotePlayers[id].disconnect();
                    delete this.remotePlayers[id];
                }
            }
        }
    }

    update(time, delta) {
        this.player.updateMovement();

        if (!globalVar)
            return;

        // detect surrounding players
        var bodies = this.physics.overlapCirc(
            this.player.body.center.x, this.player.body.center.y, 150, true, true)
        if (bodies.length - 1 != this.inRangePlayers.size) {
            const rangePlayers = bodies.filter((b) => b.gameObject instanceof LocalPlayer || b.gameObject instanceof RemotePlayer)
                .map((b) => b.gameObject.id);
            if (rangePlayers.length > this.inRangePlayers.size) {
                // wire players
                // ws.wirePlayer('1', 
                //     rangePlayers.filter((id) => {
                //         const entered = !this.inRangePlayers.has(id);
                //         if (entered) this.inRangePlayers.add(id);
                //         return entered;
                //     })
                // );
                console.log('wire')
            } else {
                // unwire players
                // ws.unwirePlayer('1', 
                //     [...this.inRangePlayers].filter((id) => {
                //         const left = !rangePlayers.includes(id);
                //         if (left) this.inRangePlayers.delete(id);
                //         return left;
                //     })
                // );
                console.log('unwire')
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
class Player extends Phaser.GameObjects.Container {
    speed = 500;  // 900 is the upperbound ig
    step = 0;
    lastVelocity;

    constructor(scene, x, y) {
        super(scene, x, y);

        // add container to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // add sprite and text to scene and then container
        const sprite = scene.add.sprite(0, 0, 'player', 6)
            .setOrigin(0.5)
            .setScale(3);
        const text = scene.add.bitmapText(0, -48, 'atari', '', 24)
            .setOrigin(0.5)
            .setCenterAlign()
            .setText([
                "Me",
                'G???',
            ]);
        const circle = scene.add.circle(0, 0, 150)
            .setOrigin(0.5)
            .setStrokeStyle(1, 0x1a65ac);

        this.addSprite(sprite);
        this.addText(text);
        this.add(circle);
        
        this.body.setSize(sprite.width * 3, sprite.height * 3)
            .setOffset(-sprite.width/2 * 3, -sprite.height/2 * 3);

        // set some default physics properties
        this.body.setCollideWorldBounds(true);

        this.body.onWorldBounds = true; // not sure if this is important

        this.getSprite().anims.create({
            key: 'horizontal',
            frames: this.getSprite().anims.generateFrameNumbers('player', { frames: [1, 7, 1, 13]}),
            frameRate: 10,
            repeat: -1
        });
        this.getSprite().anims.create({
            key: 'up',
            frames: this.getSprite().anims.generateFrameNumbers('player', { frames: [2, 8, 2, 14]}),
            frameRate: 10,
            repeat: -1
        });
        this.getSprite().anims.create({
            key: 'down',
            frames: this.getSprite().anims.generateFrameNumbers('player', { frames: [ 0, 6, 0, 12 ] }),
            frameRate: 10,
            repeat: -1
        });
    }

    addSprite(sprite) {
        this.addAt(sprite, 0);
    }

    getSprite() {
        return this.getAt(0);
    }

    addText(text) {
        this.addAt(text, 1);
    }

    getText() {
        return this.getAt(1);
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
            this.getSprite().anims.play('up', true);
        }
        else if (velocity.y > 0) {
            this.getSprite().anims.play('down', true);
        }
        else if (velocity.x < 0) {
            this.getSprite().flipX = true;
            this.getSprite().anims.play('horizontal', true);
        }
        else if (velocity.x > 0) {
            this.getSprite().flipX = false;
            this.getSprite().anims.play('horizontal', true);
        } else {
            this.getSprite().anims.stop();
        }
    }
}


class LocalPlayer extends Player {

    constructor(scene, x, y, id) {
        super(scene, x, y);
        this.id = id;
        this.getText().setText([
            `User ${this.id}`,
            'G???',
        ]);
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
        super(scene, x, y);
        this.id = id;
        this.getText().setText([
            `User ${this.id}`,
            'G???',
        ]);

        this.unsubscribe = usePlayerStore.subscribe(
            this.handlePlayerMovement, state => state.players[this.id]);
    }

    handlePlayerMovement = ({position, velocity}) => {
        this.updateAnimation(velocity);
        this.body.reset(position.x, position.y);
        this.body.setVelocity(velocity.x, velocity.y);
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
