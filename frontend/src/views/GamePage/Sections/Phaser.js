import React from "react";

import * as Game from "phaser/Game";


class Phaser extends React.Component {
  gameOver = false;
  state = {opacity: 1}
  
  componentDidMount() {
    const game = Game.setupGame();

    document.onpointerup = () => {
      if (this.gameOver) {
        this.setState({opacity: 1})
        game.input.enabled = true;
        game.input.keyboard.enabled = true;
      } else {
        this.setState({opacity: 0.7})
        game.input.events.emit("pause");
        game.input.enabled = false;
        game.input.keyboard.enabled = false;
      }
    }
  }

  mouseOut = () => {
    this.gameOver = false;
  }

  mouseOver = () => {
    this.gameOver = true;
  }

  render() {
    return (
      <div id="game-container"
        style={{opacity: this.state.opacity}}
        onMouseOut={this.mouseOut} 
        onMouseOver={this.mouseOver}>
      </div>
    );
  }
}

export default Phaser;
