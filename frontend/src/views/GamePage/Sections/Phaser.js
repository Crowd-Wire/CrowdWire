import React from "react";

import * as Game from "phaser/Game";


class Phaser extends React.Component {
  
  componentDidMount() {
    Game.setupGame();
    // window.addEventListener('resize', () => {
    //   game.resize(window.innerWidth, window.innerHeight);
    // });
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div id="game-container" style={{
       }}>{/*style={{pointerEvents: "none", display: "none"}}>*/}</div>
    );
  }
}

export default Phaser;



