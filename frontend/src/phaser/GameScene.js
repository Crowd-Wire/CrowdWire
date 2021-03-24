import * as Phaser from 'phaser';

import logoImg from '../assets/logo.png';


const sceneConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};

class GameScene extends Phaser.Scene {
    
    constructor() {
        super(sceneConfig);
        this.count = 0;
    }

    preload() {
        console.log(logoImg)
        this.load.image('logo', logoImg);
    }

    create() {
        const logo = this.add.image(400, 150, 'logo');
        this.add.text(50, 70, "Key D to change scene.")
        this.text = this.add.text(50, 50, `${this.count}`)
        this.tweens.add({
            targets: logo,
            y: 450,
            duration: 2000,
            ease: 'Power2',
            yoyo: true,
            loop: -1
        });

        this.input.keyboard.on('keydown-D', () => {
            // this.cameras.resetAll();
            // this.scene.transition({ target: 'FillTilesScene', duration: 2000 });
            this.scene.start('FillTilesScene');
        }, this);
    }

    update() {
        this.count += 1;
        this.text.setText(`${this.count}`)
    }
    
}

export default GameScene;