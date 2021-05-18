import React from "react";

import * as Game from "phaser/Game";
import MouseIcon from '@material-ui/icons/Mouse';


const noSelectStyle = {
  "-webkit-touch-callout": "none", /* iOS Safari */
    "-webkit-user-select": "none", /* Safari */
      "-khtml-user-select": "none", /* Konqueror HTML */
        "-moz-user-select": "none", /* Old versions of Firefox */
        "-ms-user-select": "none", /* Internet Explorer/Edge */
            "user-select": "none", /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}

class Phaser extends React.Component {
  gameOver = false;
  state = {opacity: 1}
  
  componentDidMount() {
    this.game = Game.setupGame();

    document.onpointerup = () => {
      if (this.gameOver) {
        this.enablePhaser();
      } else {
        this.disablePhaser();
      }
    }
  }

  mouseOut = () => {
    this.gameOver = false;
  }

  mouseOver = () => {
    this.gameOver = true;
  }

  enablePhaser = () => {
    this.setState({opacity: 1})
    this.game.input.enabled = true;
    this.game.input.keyboard.enabled = true;
  }

  disablePhaser = () => {
    this.setState({opacity: 0.7})
    this.game.input.events.emit("pause");
    this.game.input.enabled = false;
    this.game.input.keyboard.enabled = false;
  }

  render() {
    const {opacity} = this.state;
    return (
      <>
        <div id="game-container"
          style={{opacity: opacity}}
          onMouseOut={this.mouseOut} 
          onMouseOver={this.mouseOver}>
        </div>
        { opacity != 1 &&
          <div 
            onClick={this.enablePhaser}
            style={{
              position: 'fixed',
              bottom: 20,
              zIndex: 98,
              fontSize: "1rem",
              fontWeight: 500,
              display: 'flex',
              width: "100%",
              justifyContent: 'center',
              backgroundImage: "linear-gradient(to right, transparent, transparent, rgb(204, 204, 204, 0.2), rgb(204, 204, 204, 0.8), " 
                + "rgb(204, 204, 204, 0.2), transparent, transparent)",
              padding: "0.5rem 0",
              ...noSelectStyle
          }}>
            <MouseIcon /> CLICK TO ENABLE MOVEMENT
          </div>
        }
      </>
    );
  }
}

export default Phaser;
