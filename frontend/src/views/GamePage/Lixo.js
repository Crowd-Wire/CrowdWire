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
            { size: 30, tabs: [1, 2, 3] },
            { size: 20, tabs: [3] },
            { size: 50, tabs: [1] },
          ]
        },
        { size: 25, tabs: [2] },
        { size: 25, tabs: [4, 2] }
      ]
    }
  }

  gridRemoveTabs = (tabs, elemPath) => {
    this.setState(state => {
      const grid = state.grid;
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

  gridBuild = (grid = this.state.grid, depth = 0, path = []) => {
    const dimension = (depth % 2 == 0) ? "height" : "width";
    const wrapper = (depth % 2 == 0) ? "wrapperRow" : "wrapperCol";
    const margin = (depth % 2 == 0) ? "marginTop" : "marginLeft";
    const handler = (depth % 2 == 0) ? "handlerRow" : "handlerCol";

    return (
      grid.map((item, index) => {
        return (
          <>
            {
              (index > 0) ?
                <div
                  key={`0${index}`}
                  className={classNames(handler, "handler")}
                  style={{ [margin]: '-10px' }}
                ></div>
                : null
            }
            <div
              key={index}
              data-path={path.concat(index).join('-')}
              data-size={item.size}
              style={{ [dimension]: `${item.size}%`, [margin]: (index > 0) ? '-10px' : 0 }}
              className={wrapper}
            >
              {
                item.hasOwnProperty('tabs') ?
                  <GameUITabs
                    headerColor="gray"
                    tabs={item.tabs.map(t => gameWindows[t])}
                  />
                  :
                  this.gridBuild(item.grid, depth + 1, path.concat(index))
              }
            </div>
          </>
        )
      })
    );
  }

  mouseDown = () => {

  }


  componentDidMount = () => {
    let handlers = document.querySelectorAll('.handler');
    var dragginHandler;

    document.addEventListener('keyup', (e) => {
      if (e.key === 'r') this.gridRemoveTabs([], [])
    });

    document.addEventListener('mousedown', (e) => {
      handlers.forEach((h) => {
        if (e.target === h)
          dragginHandler = h;
      })
    });

    document.addEventListener('mousemove', (e) => {
      if (dragginHandler == null)
        return;


      let boxA = dragginHandler.previousSibling;
      let boxB = dragginHandler.nextSibling;

      if (document.defaultView.getComputedStyle(dragginHandler).cursor == 'ns-resize') {
        const totalHeight = parseFloat(boxA.getAttribute('data-size')) + parseFloat(boxB.getAttribute('data-size'));
        const boxAPath = boxA.getAttribute('data-path').split('-').map((p) => parseInt(p, 10));
        const totalHeightPx = boxA.offsetHeight + boxB.offsetHeight;
        const newHeightPx = e.clientY - boxA.offsetTop;

        if (e.clientY - boxA.offsetTop < 200 || boxA.offsetTop + totalHeightPx - e.clientY < 200)
          return;

        this.setState(state => {
          const grid = state.grid;
          let parent = { grid };

          // locate parent element
          for (let p of boxAPath.slice(0, -1)) {
            parent = parent.grid[p];
          }

          const boxAObj = parent.grid[boxAPath[boxAPath.length - 1]];
          const boxBObj = parent.grid[boxAPath[boxAPath.length - 1] + 1];

          console.log(parent, boxAObj, boxBObj)

          boxAObj.size = parseFloat((newHeightPx / totalHeightPx * totalHeight)).toFixed(2);
          boxBObj.size = totalHeight - boxAObj.size;

          return { grid };
        })

      } else {
        const totalWidth = parseFloat(boxA.getAttribute('data-size')) + parseFloat(boxB.getAttribute('data-size'));
        const boxAPath = boxA.getAttribute('data-path').split('-').map((p) => parseInt(p, 10));
        const totalWidthPx = boxA.offsetWidth + boxB.offsetWidth;
        const newWidthPx = e.clientX - boxA.offsetLeft;

        if (e.clientX - boxA.offsetLeft < 200 || boxA.offsetLeft + totalWidthPx - e.clientX < 200)
          return;

        this.setState(state => {
          const grid = state.grid;
          let parent = { grid };

          // locate parent element
          for (let p of boxAPath.slice(0, -1)) {
            parent = parent.grid[p];
          }

          const boxAObj = parent.grid[boxAPath[boxAPath.length - 1]];
          const boxBObj = parent.grid[boxAPath[boxAPath.length - 1] + 1];

          console.log(parent, boxAObj, boxBObj)

          boxAObj.size = parseFloat((newWidthPx / totalWidthPx * totalWidth)).toFixed(2);
          boxBObj.size = totalWidth - boxAObj.size;

          return { grid };
        })
      }
    })

    document.addEventListener('mouseup', (e) => {
      dragginHandler = null;
    });

  }


  render() {
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

        <div className={"wrapperCol"} style={{ backgroundColor: "#ddd", maxHeight: '100vh', height: '100%' }}>
          {this.gridBuild()}
        </div>


        {/* <div className={"wrapperCol"} style={{backgroundColor: "#ddd", maxHeight: '100vh', height: '100%'}}>
          <div className={"wrapperRow"} style={{ height: '33%' }}>
            
            <div className={"wrapperCol"} style={{ width: '50%' }}>
              <GameUITabs
                headerColor="gray"
                tabs={[gameWindows[1]]}
              />
            </div>
            
            <div className={classNames("handlerCol", "handler")} style={{marginLeft: '-10px'}}></div>
            <div className={"wrapperCol"} style={{ width: '50%' , marginLeft: '-10px'}}>
              <GameUITabs
                  headerColor="gray"
                  tabs={[gameWindows[1], gameWindows[2]]}
              />
            </div>

          </div>
          <div data="indexlololo" className={classNames("handlerRow", "handler")} style={{marginTop: '-10px'}}></div>
          <div className={"wrapperRow"} style={{ height: '33%' , marginTop: '-10px'}}>
            <GameUITabs
                  headerColor="gray"
                  tabs={[gameWindows[1], gameWindows[2]]}
              />
          </div>
          <div className={classNames("handlerRow", "handler")} style={{marginTop: '-10px'}}></div>
          <div className={"wrapperRow"} style={{ height: '34%' , marginTop: '-10px'}}>
              <GameUITabs
                  headerColor="gray"
                  tabs={[gameWindows[3], gameWindows[4]]}
              />
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

