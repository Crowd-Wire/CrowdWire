import React from "react";

import { connect } from "react-redux";

import gameUITypes from "consts/gameUITypes";
import { toggleGameUI } from "redux/store";


// @material-ui/core components

// @material-ui/icons
import DragHandleIcon from '@material-ui/icons/DragHandle';

// core components



const s1 = {
  position: "absolute",
  zIndex: 9,
  backgroundColor: "#f1f1f1",
  border: "1px solid #d3d3d3",
  textAlign: "center",
}

const s2 =  {
  padding: "10px",
  cursor: "move",
  zIndex: 10,
  backgroundColor: "#2196F3",
  color: "#fff",
}


class MapEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };


    
  }
  
  render() {
    
    return (
      <div id="mydiv" style={{...this.props.style, right: 0, top: 0, ...s1}}>
        <div id="mydivheader" style={s2}>
          <DragHandleIcon />
        </div>
        <div style={{backgroundColor: "blue", height: "300px", width: "300px"}}>
          Map Editor
          <button onClick={() => this.props.toggleGameUI(gameUITypes.MAP)}>X CLOSE</button>
        </div>
      </div>
    );
  }
}


const mapDispatchToProps = (dispatch) => ({
  toggleGameUI: (activeUI) => dispatch(toggleGameUI(activeUI)),
});

export default connect(null, mapDispatchToProps)(MapEditor);
