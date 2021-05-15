import React from "react";

import * as Game from "phaser/Game";
import RoomCall from "./../../../components/Communications/RoomCall";


class Phaser extends React.Component {
  
  componentDidMount() {
    var game = Game.setupGame();
    // window.addEventListener('resize', () => {
    //   game.resize(window.innerWidth, window.innerHeight);
    // });
    // game.input.enabled = false;
    // game.input.keyboard.enabled = false;
    console.log(game)
    console.log(game.input)
    console.log(game.input.enabled)
    // console.log(game.input.events._events.gameout.context.enabled)
    // console.log(game.input.events._events.gameover.context.enabled)
    // console.log(game.input.events._events.gameout.context.enabled)
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div id="game-container" style={{}}>{/*style={{pointerEvents: "none", display: "none"}}>*/}
        <RoomCall />
      </div>
    );
  }
}

export default Phaser;



