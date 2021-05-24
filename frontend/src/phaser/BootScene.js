import * as Phaser from 'phaser';

import useWorldUserStore from "stores/useWorldUserStore";

import MapManager from "./MapManager.ts";


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
                console.log("FINISHED PRELOAD");
                this.scene.start('GameScene');
            }, 500);
        }, this);
        

        const mapManager = new MapManager(useWorldUserStore.getState().world_user.world_id);
        this.registry.set('mapManager', mapManager);
        
        mapManager.fetchMap().then(() => mapManager.loadMap(this));

        // our two characters???
        this.load.spritesheet('player', `${process.env.PUBLIC_URL}/assets/characters/RPG_assets.png`, { frameWidth: 16, frameHeight: 16 });

        this.load.bitmapFont('atari', `${process.env.PUBLIC_URL}/assets/fonts/bitmap/gem.png`, `${process.env.PUBLIC_URL}/assets/fonts/bitmap/gem.xml`);
        console.log("all done")
    }
}

export default BootScene;
