import * as Phaser from 'phaser';

import { getSocket } from "services/socket";

import usePlayerStore from "stores/usePlayerStore.ts";


const sceneConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};

var globalVar = true;



class GameScene extends Phaser.Scene {
    remotePlayers = {};
    localPlayers = {};
    inRangePlayers = new Set();
    count = 0;
    floatTile;
    ws = getSocket('1');

    constructor() {
        super(sceneConfig);
    }

    create() {
        this.map = this.add.tilemap('map');

        // MapBuilder(this, 'map');

        const wallTileset = this.map.addTilesetImage('wall-tiles');
        const utilTileset = this.map.addTilesetImage('util-tiles');
        const tableTileset = this.map.addTilesetImage('table-tiles');
        const lixoTileset = this.map.addTilesetImage('table-V');

        this.map.createDynamicLayer('Ground', wallTileset);
        this.roomLayer = this.map.createDynamicLayer('Room', utilTileset);
        this.collisionLayer = this.map.createDynamicLayer('Collision', [wallTileset, tableTileset, utilTileset]);//lixoTileset]);
        this.floatLayer = this.map.createDynamicLayer('Float', wallTileset).setDepth(1000);

        // Create a sprite group for all objects, set common properties to ensure that
        // sprites in the group don't move via gravity or by player collisions
        // this.objects = this.physics.add.group({
        //     allowGravity: false,
        //     immovable: true
        // });

        // Let's get the object objects, these are NOT sprites
        // const objectLayer = this.map.createFromObjects('Object', {key: 'table-V'});

        // Now we create objects in our sprite group for each object in our map
        // objectLayer['objects'].forEach(obj => {
        //     console.log(obj)
        //     // Add new objects to our sprite group, change the start y position to meet the platform
        //     const object = this.objects.create(obj.x, obj.y + 200 - obj.height, 'table-H').setOrigin(0, 0);
        // });
  

        // -1 makes all tiles on this layer collidable
        this.collisionLayer.setCollisionByExclusion([-1]);

        // create the map borders
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;

        // listen to the arrow keys
        this.cursors = this.input.keyboard.addKeys({
            up:Phaser.Input.Keyboard.KeyCodes.W,
            down:Phaser.Input.Keyboard.KeyCodes.S,
            left:Phaser.Input.Keyboard.KeyCodes.A,
            right:Phaser.Input.Keyboard.KeyCodes.D
        });

        // static players for range test
        this.localPlayers['-1'] = new LocalPlayer(this, 0, 500, '-1');
        this.localPlayers['-2'] = new LocalPlayer(this, 500, 600, '-2');
        this.localPlayers['-3'] = new LocalPlayer(this, 650, 450, '-3');

        // main player
        this.player = new Player(this, 50, 50);

        // connect to room
        this.ws.joinRoom('1', {x: 50, y: 50});

        // make camera follow player
        //this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player)
            .setBackgroundColor("#0C1117")//'#080C10');
            .setZoom(1.5);
        this.cameras.main.roundPixels = true;   // prevent tiles bleeding (showing border lines on tiles)

        this.physics.add.collider(this.player, this.collisionLayer);

        this.input.keyboard.on('keydown-Q', () => {
            globalVar = !globalVar;
        }, this);
        
        this.unsubscribe = usePlayerStore.subscribe(this.handlePlayerConnection, state => Object.keys(state.players));

        // TODO: remove after testing
        this.unsubscribe2 = usePlayerStore.subscribe(this.handleGroups, state => ({...state.groups}));

        this.physics.add.collider(Object.values(this.remotePlayers), this.collisionLayer);
    }

    // TODO: remove after tests
    // allows devs to see in frontend the groups assigned to the users
    teste_player_id;
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
                    let position = usePlayerStore.getState().players[id].position;
                    this.remotePlayers[id] = new RemotePlayer(this, position.x, position.y, id);
                    this.physics.add.collider(this.remotePlayers[id], this.collisionLayer);
                }
            }
        } else {
            // disconnection
            for (const id of prevPlayers) {
                if (!(id in storePlayers)) {
                    this.remotePlayers[id].destroy();
                    delete this.remotePlayers[id];
                }
            }
        }
    }

    update(time, delta) {
        this.player.update();

        // Convert the mouse position to world position within the camera
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        // Draw tiles (only within the groundLayer)
        if (this.input.manager.activePointer.isDown) {
            const tile = this.collisionLayer.putTileAtWorldXY(243, worldPoint.x, worldPoint.y);
            if (tile)
                tile.setCollision(true);
        }
                
        if (!globalVar)
            return;
        
        const tile = this.roomLayer.getTileAtWorldXY(this.player.body.center.x, this.player.body.center.y);
        
        if (tile)
            console.log(tile.properties.type, tile.properties.id);
        
        // detect surrounding players
        var bodies = this.physics.overlapCirc(
            this.player.body.center.x, this.player.body.center.y, 150, true, true)
        if (bodies.length && bodies.length - 1 != this.inRangePlayers.size) {
            const rangePlayers = bodies.filter((b) => b.gameObject instanceof LocalPlayer || b.gameObject instanceof RemotePlayer)
                .map((b) => b.gameObject.id);
            if (rangePlayers.length > this.inRangePlayers.size) {
                // wire players
                this.ws.wirePlayer('1', 
                    rangePlayers.filter((id) => {
                        const entered = !this.inRangePlayers.has(id);
                        if (entered) this.inRangePlayers.add(id);
                        return entered;
                    })
                );
            } else {
                // unwire players
                this.ws.unwirePlayer('1', 
                    [...this.inRangePlayers].filter((id) => {
                        const left = !rangePlayers.includes(id);
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
class Player extends Phaser.GameObjects.Container {
    speed = 500;  // 900 is the upperbound ig
    step = 0;
    lastVelocity;
    ws = getSocket('1');

    constructor(scene, x, y) {
        super(scene, x, y);

        // add container to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // add sprite and text to scene and then container
        const sprite = scene.add.sprite(0, 0, 'player', 6)
            .setOrigin(0.5)
            .setScale(2);
        const text = scene.add.bitmapText(0, -32, 'atari', '', 16)
            .setOrigin(0.5)
            .setCenterAlign()
            .setText([
                "Me",
                '',
            ]);
        const circle = scene.add.circle(0, 0, 150)
            .setOrigin(0.5)
            .setStrokeStyle(1, 0x1a65ac);

        this.addSprite(sprite)
            .addText(text)
            .add(circle);

        this.body.setSize(sprite.width * 2, sprite.height)
            .setOffset(-sprite.width/2 * 2, 0);

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
        return this;
    }

    getSprite() {
        return this.getAt(0);
    }

    addText(text) {
        this.addAt(text, 1);
        return this;
    }

    getText() {
        return this.getAt(1);
    }

    update() {
        this.updateMovement();
        this.updateAnimation();
    }

    updateRoom() {

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

        if (this.step == 1 && !this.body.speed) {
            this.ws.sendMovement('1', this.body.center, this.body.velocity);
            this.step = 0;
        } else if (!this.lastVelocity || !this.body.velocity.equals(this.lastVelocity)) {
            this.ws.sendMovement('1', this.body.center.subtract(this.body.newVelocity), this.body.velocity);
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
            this.updateMovement, state => state.players[this.id]);
    }

    updateMovement = ({position, velocity}) => {
        this.updateAnimation(velocity);
        this.body.reset(position.x, position.y);
        this.body.setVelocity(velocity.x, velocity.y);
    }

    /**
     * Destroys the object cleanly.
     */
    destroy() {
        this.unsubscribe();
        this.destroy();
    }
}

export default GameScene;
