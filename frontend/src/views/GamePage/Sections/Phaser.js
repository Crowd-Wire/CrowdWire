import React from "react";

import * as Game from "phaser/Game";


class Phaser extends React.Component {

  constructor(props) {
    super(props);
  }
  
  componentDidMount() {
    Game.setupGame();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div id="game-container"></div>
    );
  }
}

export default Phaser;



