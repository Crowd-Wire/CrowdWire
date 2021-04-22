import React from "react";

import classNames from 'classnames';

import { connect } from "react-redux";

import gameUITypes from "consts/gameUITypes";
// import { toggleGameUI } from "redux/store";

import Phaser from "./Sections/Phaser";
import MapUI from "./Sections/MapUI";
import MapEditorUI from "./Sections/MapEditorUI";
// MapManager
// Settings

import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Grid from '@material-ui/core/Grid';
import GameUITabs from "components/CustomTabs/GameUITabs.js";


import "./Lixo.css";
import { makeStyles, withStyles } from '@material-ui/core/styles';

// const gameUIStyle = {
//   position: "absolute",
//   zIndex: 2,
// }



const gameWindows = {
  0: {
    tabName: 'Red',
    tabContent: <div style={{ width: '400px', height: '300px', backgroundColor: 'red', fontSize: '2rem' }}>0</div>
  },
  1: {
    tabName: 'Blue',
    tabContent: <div style={{ width: '400px', height: '300px', backgroundColor: 'blue', fontSize: '2rem' }}>1</div>,
  },
  2: {
    tabName: 'Green',
    tabContent: <div style={{ width: '400px', height: '300px', backgroundColor: 'green', fontSize: '2rem' }}>2</div>,
  },
  3: {
    tabName: 'Yellow',
    tabContent: <div style={{ width: '400px', height: '300px', backgroundColor: 'yellow', fontSize: '2rem' }}>3</div>,
  },
  4: {
    tabName: 'Orange',
    tabContent: <div style={{ width: '400px', height: '300px', backgroundColor: 'orange', fontSize: '2rem' }}>4</div>,
  },
  5: {
    tabName: 'Game',
    tabContent: <><Phaser /></>,
  },
}


class GamePage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      grid: [
        {
          size: 50,
          grid: [
            {size: 30, tabs: [1, 2, 3]},
            {size: 20, tabs: [3]},
            {size: 50, tabs: [1]},
          ]
        },
        {size: 25, tabs: [2]},
        {size: 25, tabs: [4,2]}
      ]
    }
  }

  gridRemoveTabs = (tabs, elemPath) => {
    this.setState(state => {
      let grid = state.grid;
      let parent;
      let elem = { grid };

      // locate element
      for (let p of elemPath) {
        parent = elem;
        elem = elem.grid[p];
      }

      if (elem.tabs === undefined) {
        // assert
        console.error("elemPath wrong")
      }

      // remove tabs from element
      for (let tab of tabs) {
        const index = elem.tabs.indexOf(tab);
        if (index > -1)
          elem.tabs.splice(index, 1);
      }

      // normalize
      if (!elem.tabs.length) {
        const index = parent.grid.indexOf(elem);
        if (index > -1)
          parent.grid.splice(index, 1);
      }

      return { grid };
    })
  }

  gridBuild = (grid=this.state.grid, depth=0) => {
    if (depth > 3)
      return 'ola';
 
    return (
      grid.map((item, index) => (
        <div 
          key={index} style={depth % 2 == 0 ? { height: `${item.size}%` } : { width: `${item.size}%` }}
          className={depth % 2 == 0 ? "wrapperRow" : "wrapperCol"}
        >
          { 
            item.hasOwnProperty('tabs') ?
              <GameUITabs
                headerColor="gray"
                tabs={item.tabs.map(t => gameWindows[t])}
              />
            :
              this.gridBuild(item.grid, depth + 1)
          }
        </div>
      ))
    );
  }

  mouseDown = () => {

  }


  componentDidMount = () => {
    let handlers = document.querySelectorAll('.handler');
    var dragginHandler;

    document.addEventListener('keyup', (e) => {
      if(e.key === 'r') this.gridRemoveTabs([], [])
    });

    document.addEventListener('mousedown', function(e) {
      handlers.forEach((h) => {
        if (e.target === h)
          dragginHandler = h;
      })
    });

    document.addEventListener('mousemove', function(e) {
      if (dragginHandler == null)
        return;


      let boxA = dragginHandler.previousSibling; 
      let boxB = dragginHandler.nextSibling; 

      if (document.defaultView.getComputedStyle(dragginHandler).cursor == 'ns-resize') {
        // const totalHeightPerc = boxA.style.height
        const totalHeight = boxA.offsetHeight + boxB.offsetHeight;
        const newHeight = e.clientY - boxA.offsetTop;

        if (e.clientY - boxA.offsetTop < 200 || boxA.offsetTop + totalHeight - e.clientY < 200)
          return;

        boxA.style.height = `${newHeight}px`;
        boxB.style.height = `${totalHeight-newHeight}px`;

      } else {
        const combinedWidth = boxA.offsetWidth + boxB.offsetWidth;
        const newWidth = e.clientX - boxA.offsetLeft;

        if (e.clientX - boxA.offsetLeft < 200 || boxA.offsetLeft + combinedWidth - e.clientX < 200)
          return;

        boxA.style.width = `${newWidth}px`;
        boxB.style.width = `${combinedWidth-newWidth}px`;
      }
    });

    document.addEventListener('mouseup', function(e) {
      dragginHandler = null;
    });
    
  }


  render() {
    const { classes } = this.props;
    let componentUI = <MapUI />;

    if (this.props) {
      switch (this.props.activeUI) {
        case gameUITypes.MAP:
          componentUI = <MapUI />;
          break;
        case gameUITypes.MAP_EDITOR:
          componentUI = <MapEditorUI />;
          break;
      }
    }


    return (
      <>
        {/* Game UI */}
        {/* <div id="uiRoot">
          {React.cloneElement(
            componentUI,
            {style: gameUIStyle}
          )}
        </div> */}

        {/* Game */}
        {/* <div style={{backgroundColor: "#ccc", height: '100vh', display: 'flex', flexFlow: 'row wrap', overflow: 'hidden' }}>
          {gridBuilder(this.state.grid2)}
        </div> */}

        <div className={"wrapperCol"} style={{backgroundColor: "#ccc", maxHeight: '100vh', height: '100%'}}>
          {this.gridBuild()}
        </div>

     
        {/* <div className={classes.wrapperCol} style={{backgroundColor: "#ccc", maxHeight: '100vh', height: '100%'}}>
          <div className={classes.wrapperRow} style={{ height: '33%' }}>
            
            <div className={classes.wrapperCol} style={{ width: '50%' }}>
              <GameUITabs
                headerColor="gray"
                tabs={[gameWindows[1]]}
              />
            </div>
            <div className={classNames(classes.handlerCol, "handler")}></div>
            <div className={classes.wrapperCol} style={{ width: '50%' }}>
              <GameUITabs
                  headerColor="gray"
                  tabs={[gameWindows[1], gameWindows[2]]}
              />
            </div>

          </div>
          <div data="indexlololo" className={classNames(classes.handlerRow, "handler")}></div>
          <div className={classes.wrapperRow} style={{ height: '33%' }}>
            <GameUITabs
                  headerColor="gray"
                  tabs={[gameWindows[1], gameWindows[2]]}
              />
          </div>
          <div className={classNames(classes.handlerRow, "handler")}></div>
          <div className={classes.wrapperRow} style={{ height: '34%' }}>
            <GameUITest/>
          </div>
        </div>  */}


    

      </>
    );
  }
}


const mapStateToProps = (state) => ({
  ...state
});

// const mapDispatchToProps = (dispatch) => ({
//   toggleGameUI: () => dispatch(toggleGameUI),
// });

export default connect(mapStateToProps)(GamePage);

