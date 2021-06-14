import * as Phaser from 'phaser';
import { API_BASE } from "config";

import MapManager from "../MapManager.ts";


const sceneConfig = {
    active: false,// hum, n sei o q faz ainda
    visible: false,// same
    key: 'BootScene',
};

class BootScene extends Phaser.Scene {
    
    constructor() {
        super(sceneConfig);
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width/2 - 160, height/2 - 75, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        const assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });

        assetText.setOrigin(0.5, 0.5);
        
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width/2 - 150, height/2 - 65, 300 * value, 30);
        });
        
        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });

        this.load.once('complete', function () {
            setTimeout(() => {
                progressBar.destroy();
                progressBox.destroy();
                loadingText.destroy();
                percentText.destroy();
                assetText.destroy();
                this.scene.start(this.registry.get('scene'));
            }, 500);
        }, this);
        

        const mapManager = new MapManager();
        
        this.load.crossOrigin = "Anonymous";
        mapManager.loadMap(this);

        this.load.image('__CONFERENCE', API_BASE + "static/maps/tilesets/tiles/conference.png");
        // this.load.spritesheet('player', API_BASE + "static/characters/RPG_assets.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('avatars_1', API_BASE + "static/characters/avatars_1.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('avatars_2', API_BASE + "static/characters/avatars_2.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('avatars_3', API_BASE + "static/characters/avatars_3.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('avatars_4', API_BASE + "static/characters/avatars_4.png", { frameWidth: 48, frameHeight: 48 });
        this.load.bitmapFont('atari', `${process.env.PUBLIC_URL}/fonts/bitmap/gem.png`, `${process.env.PUBLIC_URL}/fonts/bitmap/gem.xml`);
        this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
    }
}

export default BootScene;
