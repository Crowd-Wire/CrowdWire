import React from "react";

import { connect } from "react-redux";

import gameUITypes from "consts/gameUITypes";
import { toggleGameUI } from "redux/store";

import Button from "components/CustomButtons/Button.js";


// @material-ui/core components

// @material-ui/icons

// core components

class Map extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  
  render() {
    return (

      <div style={{...this.props.style, left: 0, top: 0}}>
        <div style={{ height: "300px", width: "300px"}}>
          Map
          <button onClick={() => this.props.toggleGameUI(gameUITypes.MAP_EDITOR)}>Edit map</button>
          <Button color="github" onClick={this.handleClick1}>Default</Button>
        </div>
        <Button color="primary" onClick={this.handleClick2}>Default</Button>
      </div>
      
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  toggleGameUI: (activeUI) => dispatch(toggleGameUI(activeUI)),
});

export default connect(null, mapDispatchToProps)(Map);
