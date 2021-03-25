import * as Phaser from 'phaser';
import GameScene from './GameScene';
import FillTilesScene from './FillTilesScene';


const gameConfig = {
  title: 'Sample',

  type: Phaser.AUTO,

  parent: "game-container",
  width: 1600,
  height: 1600,

  /*
  physics: {
    default: 'arcade',
    arcade: {
        debug: true,
    },
  },
  */
  scene: [
    GameScene, 
    FillTilesScene
  ],
  backgroundColor: '#000000',
};


export function setupGame() {
  const game = new Phaser.Game(gameConfig);
  return game;
}
