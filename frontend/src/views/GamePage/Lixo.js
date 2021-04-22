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

import { makeStyles, withStyles } from '@material-ui/core/styles';

// const gameUIStyle = {
//   position: "absolute",
//   zIndex: 2,
// }



const resizeStyle = {
  wrapper: {
    backgroundColor: '#fff',
    color: '#444',

    /* Use flexbox */
    display: 'flex',
  },
  
  box: {
    backgroundColor: '#444',
    color: '#fff',
    borderRadius: '5px',
    padding: '20px',
    fontSize: '150%',

    /* Use box-sizing so that element's outerwidth will match width property */
    boxSizing: 'border-box',
  
    /* Allow box to grow and shrink, and ensure they are all equally sized */
    flex: '1 1 auto',
  },

  wrapperCol: {
    display: 'flex', 
    flexDirection: 'column'
  },

  wrapperRow: {
    display: 'flex', 
    flexDirection: 'row'
  },

  handlerCol: {
    width: '10px',
    padding: '0',
    cursor: 'ew-resize',
    flex: '0 0 auto',
    '&::before': {
      content: "",
      display: 'block',
      width: '4px',
      height: '100%',
      background: 'red',
      margin: '0 auto',
    }
  },

  handlerRow: {
    height: '10px',
    padding: '0',
    cursor: 'ns-resize',
    flex: '0 0 auto',
    '&::before': {
      content: "",
      display: 'block',
      width: '4px',
      height: '100%',
      background: 'red',
      margin: '0 auto',
    }
  }
}

const flexstyle = makeStyles({
  container: {
    background: '#3F51B5',
  
    /* give the outermost container a predefined size */
    height: '100vh',
    // flexGrow: '1',
    
    display: 'flex',
    flexDirection: 'column',
  },
  
  section: {
    margin: '10px',
    background: '#2196F3',
    flexGrow: '1',
    
    display: 'flex',
    flexDirection: 'column',
    
    /* for Firefox */
    minHeight: '0',
  },
  
  content: {
    margin: '10px',
    background: '#BBDEFB',
  },
  
  scrollableContent: {
    background: 'white',
    flexGrow: '1',
    
    overflow: 'auto',
    
    /* for Firefox */
    minHeight: '0',
  },
})


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


const gridBuilder = (grid, depth = 0) => {
  if (grid.every(n => Number.isInteger(n)))
    return (
      // <GameUITest/>
      <GameUITabs
        headerColor="gray"
        tabs={grid.map(n => gameWindows[n])}
      />
    );
  return (
    grid.map((item, k) => (
      <Grid container alignItems="stretch" direction={depth % 2 == 0 ? "row" : "column"} spacing={1} key={k}>
        {
          item.map((grid, k) => (
            <Grid container item xs key={k}> {/*style={{resize: 'both', overflow: 'auto'}}>*/}
              {gridBuilder(grid, depth + 1)}
            </Grid>
          ))
        }
      </Grid>
    ))
  );
}



const GameUITest = () => {
  const classes = flexstyle();

  return (
    // <div className={classes.container}>
      <div className={classes.section}>
        <div className={classes.content}>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Labore natus quisquam, dignissimos assumenda ratione magnam impedit quod delectus, voluptatum odio neque cupiditate rem porro blanditiis maxime doloribus quibusdam. Quam, officiis?
        </div>
        <div className={classes.content, classes.scrollableContent}>
        <div style={{ width: '400px', height: '300px', backgroundColor: 'red', fontSize: '2rem' }}>0</div>
        </div>
      </div>
     
    // </div>
  )
}

class GamePage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      grid2: [
        [
          [2],
          [[[0, 2, 4], [4]]]
        ],
        [
          [1],
          [[[4], [0]]]
        ],
        [
          [[[4, 2], [3]]],
          [2]
        ],
      ]
      // grid: [0, 1, 2, 3, 4, 5]
      ,
      grid: [
        {
          size: 50,
          grid: [
            {size: 20, tabs: [1, 2, 3]},
            {size: 20, tabs: [3]},
            {size: 50, tabs: [1]},
          ]
        },
        {id: 1, size: 50, tabs: [1]}
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

  gridBuild = (grid, depth = 0) => {
    if (grid.hasOwnProperty('tabs'))
      return (
        <GameUITabs
          headerColor="gray"
          tabs={grid.tabs.map(t => gameWindows[t])}
        />
      );
    return (
      grid.map((item, k) => (
        <div className={depth % 2 == 0 ? this.props.classes.wrapperRow : this.props.classes.wrapperCol} key={k}>
          {
            item.map((grid, k) => (
              <Grid container item xs key={k}> {/*style={{resize: 'both', overflow: 'auto'}}>*/}
                {gridBuilder(grid, depth + 1)}
              </Grid>
            ))
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
    
    // node.parentNode.childNodes[];

    return;
    var handlerA = document.querySelector('.handler-A');
    var handlerB = document.querySelector('.handler-B');

    var wrapper = handlerA.closest('.wrapper');
    var boxA = wrapper.querySelector('.box-A');
    var boxB = wrapper.querySelector('.box-B');
    var boxC = wrapper.querySelector('.box-C');

    var isHandlerADragging = false;
    var isHandlerBDragging = false;

    let lenA;
    let lenB;
    let lenC;
    let startX;

    document.addEventListener('mousedown', function(e) {
      // If mousedown event is fired from .handler, toggle flag to true
      if (e.target === handlerA) {
        isHandlerADragging = true;
        
      }
      if (e.target === handlerB) {
        isHandlerBDragging = true;
      }
      lenA = boxA.offsetWidth;
      lenB = boxB.offsetWidth;
      lenC = boxC.offsetWidth;
      startX = e.clientX;
    });
    
    document.addEventListener('mousemove', function(e) {
      // Don't do anything if dragging flag is false
      if (!isHandlerADragging && !isHandlerBDragging) {
        return false;
      }
    
      // Set boxA width properly

      // Get offset
      var containerOffsetLeft = wrapper.offsetLeft;

      // Get x-coordinate of pointer relative to container
      var pointerRelativeXpos = e.clientX - containerOffsetLeft;

      var dragSize = e.clientX - startX;

      // Resize box A
      // * 8px is the left/right spacing between .handler and its inner pseudo-element
      // * Set flex-grow to 0 to prevent it from growing
      if (isHandlerADragging) {
        console.log(lenC)
        boxC.style.width = lenC + 'px';
        boxC.style.flexShrink = 0;
        boxC.style.flexGrow = 0;

        // boxB.style.width = (pointerRelativeXpos - 8) + 'px';
        boxB.style.width = (lenB - dragSize) + 'px';
        boxB.style.flexGrow = 0;

        boxA.style.flex = '1 1 auto';
        // boxC.style.flexShrink = 1;
        // console.log(boxC.offsetWidth);
      }
      if (isHandlerBDragging) {
        boxA.style.width = lenA + 'px';
        boxA.style.flexShrink = 0;
        boxA.style.flexGrow = 0;

        // boxB.style.width = (pointerRelativeXpos - 8) + 'px';
        boxB.style.width = (lenB + dragSize) + 'px';
        boxB.style.flexGrow = 0;

        boxC.style.flex = '1 1 auto';
      }
      
    });
    
    document.addEventListener('mouseup', function(e) {
      // Turn off dragging flag when user mouse is up
      isHandlerADragging = false;
      isHandlerBDragging = false;
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


        <div className={classes.wrapperCol} style={{backgroundColor: "#ccc", maxHeight: '100vh', height: '100%'}}>
          <div className={classes.wrapperRow} style={{ height: '33%' }}>
            
            <div className={classes.wrapperCol} style={{ width: '50%' }}>
              <GameUITabs
                headerColor="gray"
                tabs={[gameWindows[1]]}
              />
            </div>
            <div className={classNames(classes.handlerCol, "handler")}></div>
            <div className={classes.wrapperCol} style={{ width: '50%' }}>
              <GameUITest/>
            </div>

          </div>
          <div data="indexlololo" className={classNames(classes.handlerRow, "handler")}></div>
          <div className={classes.wrapperRow} style={{ height: '33%' }}>
            <GameUITest/>
          </div>
          <div className={classNames(classes.handlerRow, "handler")}></div>
          <div className={classes.wrapperRow} style={{ height: '34%' }}>
            <GameUITest/>
          </div>
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

export default withStyles(resizeStyle)(connect(mapStateToProps)(GamePage));

