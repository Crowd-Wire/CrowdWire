import React from "react";

import * as Game from "phaser/Game";

class Phaser extends React.Component {

  constructor(props) {
    super(props);
    this.scene = props.scene;
  }
  
  componentDidMount() {
    document.oninput = () => {this.disablePhaser()}
    document.onclick = () => {this.enablePhaser()}
    this.game = Game.setupGame(this.scene);

    window.lixo = (w, h) => {
      this.game.scale.setParentSize(w, h);
      // this.game.scale.resize(w, h);
    }
  }

  resizePhaser = (width, height) => {
    this.game.scale.setParentSize(width, height);
  }

  enablePhaser = () => {
    this.game.input.enabled = true;
    this.game.input.keyboard.enabled = true;
  }

  disablePhaser = () => {
    this.game.input.events.emit("reset");
    this.game.input.enabled = false;
    this.game.input.keyboard.enabled = false;
  }

  render() {
    return (
      <div id="game-container"></div>
    );
  }
}

export default Phaser;
