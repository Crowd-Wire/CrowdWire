import React from "react";

import { connect } from "react-redux";

import gameUI from "consts/gameUI";
import { toggleGameUI } from "redux/store";


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
        <div style={{backgroundColor: "green", height: "300px", width: "300px"}}>
          Map
          <button onClick={() => this.props.toggleGameUI(gameUI.MAP_EDITOR)}>Edit map</button>
        </div>

      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  toggleGameUI: (activeUI) => dispatch(toggleGameUI(activeUI)),
});

export default connect(null, mapDispatchToProps)(Map);
