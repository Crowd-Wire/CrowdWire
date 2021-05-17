import React from "react";

import * as Game from "phaser/Game";


class Phaser extends React.Component {
  mouseOver = false;
  keyDown = false;
  
  componentDidMount() {
    const game = Game.setupGame();
    
    // TODO: fix when clicking out of the game while 
    // spamming different WASD keys, user keeps walking
    document.onkeydown = () => {this.keyDown = true };
    document.onkeyup = () => {this.keyDown = false };

    document.onpointerup = () => {
      if (!this.keyDown) {
        if (this.mouseOver) {
          game.input.enabled = true;
          game.input.keyboard.enabled = true;
        } else {
          game.input.enabled = false;
          game.input.keyboard.enabled = false;
        }
      }
    }

  }

  shouldComponentUpdate() {
    return false;
  }

  mouseLeave = () => {
    this.mouseOver = false;
  }

  mouseEnter = () => {
   this.mouseOver = true;
  }

  render() {
    return (
      <div id="game-container" 
        onMouseLeave={this.mouseLeave} 
        onMouseEnter={this.mouseEnter}>
      </div>
    );
  }
}

export default Phaser;
