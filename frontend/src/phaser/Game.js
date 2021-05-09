import * as Phaser from 'phaser';
import BootScene from './BootScene';
import GameScene from './GameScene';
import FillTilesScene from './FillTilesScene';

const gameConfig = {
  title: 'Sample',

  type: Phaser.AUTO,

  // prevent the blur of the textures when scaled
  pixelArt: true, 
  zoom: 2,

  // width: window.innerWidth,
  // height: window.innerHeight,

  scale: {
      parent: "game-container",

      // mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
      // mode: Phaser.DOM.RESIZE,

      // mode: Phaser.DOM.ENVELOP,
      // autoCenter: Phaser.DOM.CENTER_BOTH,

      //mode: Phaser.Scale.FIT,
      mode: Phaser.Scale.RESIZE,

      //mode: Phaser.DOM.FIT,
      // autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,

      width: '100%',
      height: '100%',
      // min: {
      //   width: 800,
      //   height: 800
      // },
      max: {
        width: window.innerWidth,
        height: window.innerHeight
      }
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
  scene: [
    BootScene,
    GameScene,
    FillTilesScene
  ],
  backgroundColor: '#434366',
};


export function setupGame() {
  const game = new Phaser.Game(gameConfig);
  return game;
}
