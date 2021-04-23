import React from "react";

import classNames from 'classnames';

import { connect } from "react-redux";

// import gameUITypes from "consts/gameUITypes";
// import { toggleGameUI } from "redux/store";

// import Phaser from "./Sections/Phaser";
// import MapUI from "./Sections/MapUI";
// import MapEditorUI from "./Sections/MapEditorUI";
// MapManager
// Settings

import GameUITabs from "components/CustomTabs/GameUITabs.js";


import style from "assets/jss/my-kit-react/views/mapEditorStyle";
import { withStyles } from '@material-ui/core/styles';



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
    tabContent: <></>,
  },
}


class MapEditor extends React.Component {

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
        if (index > -1) {
            // remove element
            parent.grid.splice(index, 1);

            // resize siblings
            const grow = elem.size / parent.grid.length;
            for (let e of parent.grid) {
                e.size += grow;
            }
        }
      }

      return { grid };
    })
  }

  gridBuild = (grid = this.state.grid, depth = 0, path = []) => {
    const dimension = (depth % 2 == 0) ? "height" : "width";
    const margin = (depth % 2 == 0) ? "marginTop" : "marginLeft";
    
    const {classes} = this.props;
    const wrapper = (depth % 2 == 0) ? classes.wrapperRow : classes.wrapperCol;
    const handler = (depth % 2 == 0) ? classes.handlerRow : classes.handlerCol;
    
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

    /* tests */
    document.addEventListener('keyup', (e) => {
      if (e.key === 'r') this.gridRemoveTabs([4, 2], [2]);
      if (e.key === 't') this.gridRemoveTabs([2], [0, 0]);
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

        if (e.clientY - boxA.offsetTop < 100 || boxA.offsetTop + totalHeightPx - e.clientY < 100)
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

        if (e.clientX - boxA.offsetLeft < 100 || boxA.offsetLeft + totalWidthPx - e.clientX < 100)
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
    const {classes} = this.props;

    return (
      <>
        {/* Game */}
        {/* <div style={{backgroundColor: "#ccc", height: '100vh', display: 'flex', flexFlow: 'row wrap', overflow: 'hidden' }}>
          {gridBuilder(this.state.grid2)}
        </div> */}
        <div className={classes.navbar} style={{display: 'flex'}}>
          <div className={classes.navbarItem}>Option1</div>
          <div className={classes.navbarItem}>Option2</div>
          <div className={classes.navbarItem}>Option3</div>
        </div>

        <div className={classes.wrapperCol} style={{ backgroundColor: "#ddd", maxHeight: 'calc(100vh - 50px)', height: '100%' }}>
          {this.gridBuild()}
        </div>

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

export default withStyles(style)(connect(mapStateToProps)(MapEditor));

