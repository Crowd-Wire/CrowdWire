import * as Phaser from 'phaser';

import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import WorldEditorScene from './scenes/WorldEditorScene.js';


const gameConfig = {
  title: 'Sample',

  type: Phaser.AUTO,

  // prevent the blur of the textures when scaled
  pixelArt: true, 

  scale: {
    parent: "game-container",
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    width: '100%',
    height: '100%',
    // max: {
    //   width: window.innerWidth,
    //   height: window.innerHeight
    // }
  },

  // autoResize: true,//n faz nasda
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: { y: 0 },
      fps: 60,
    },
  },
  backgroundColor: '#434366',
};

const sceneConfig = {
  GameScene: {
    zoom: 2,
    scene: [BootScene, GameScene],
  },
  WorldEditorScene: {
    zoom: 1,
    scene: [BootScene, WorldEditorScene],
  }
}

export function setupGame(scene) {
  const game = new Phaser.Game({...gameConfig, ...sceneConfig[scene]});
  game.registry.set('scene', scene);
  return game;
}
