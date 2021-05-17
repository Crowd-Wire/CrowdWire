import React from "react";

import * as Game from "phaser/Game";


class Phaser extends React.Component {
  mouseOver = false;
  keyDown = false;
  enabled = false;
  state = {opacity: 1}
  
  componentDidMount() {
    const game = Game.setupGame();
    
    // TODO: fix when clicking out of the game while 
    // spamming different WASD keys, user keeps walking
    document.onkeydown = () => {this.keyDown = true };
    document.onkeyup = () => {this.keyDown = false };


    // game.input.on("gameover", () => {
    //   console.log("gameover")
    // })

    document.onpointerup = () => {
      console.log("mouseOver", this.mouseOver);
      console.log("keyDown", this.keyDown);

      if (this.mouseOver) {
        this.setState({opacity: 1})
        game.input.enabled = true;
        game.input.keyboard.enabled = true;
      } else if (!this.keyDown) {
        this.setState({opacity: 0.6})
        game.input.enabled = false;
        game.input.keyboard.enabled = false;
      }
    }

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
        style={{opacity: this.state.opacity}}
        onMouseOut={this.mouseLeave} 
        onMouseOver={this.mouseEnter}>
          {console.log("render")}
      </div>
    );
  }
}

export default Phaser;
