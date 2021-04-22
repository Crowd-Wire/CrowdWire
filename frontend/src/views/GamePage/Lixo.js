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

  handlerCol: {
    width: '2px',
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
    height: '2px',
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
    tabContent: <div style={{ width: '200px', height: '200px', backgroundColor: 'red', fontSize: '2rem' }}>0</div>
  },
  1: {
    tabName: 'Blue',
    tabContent: <div style={{ width: '200px', height: '200px', backgroundColor: 'blue', fontSize: '2rem' }}>1</div>,
  },
  2: {
    tabName: 'Green',
    tabContent: <div style={{ width: '200px', height: '200px', backgroundColor: 'green', fontSize: '2rem' }}>2</div>,
  },
  3: {
    tabName: 'Yellow',
    tabContent: <div style={{ width: '200px', height: '200px', backgroundColor: 'yellow', fontSize: '2rem' }}>3</div>,
  },
  4: {
    tabName: 'Orange',
    tabContent: <div style={{ width: '200px', height: '200px', backgroundColor: 'orange', fontSize: '2rem' }}>4</div>,
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
          Bacon ipsum dolor amet brisket ribeye pork shoulder doner beef cow bresaola ham hock capicola kevin pig. Pork loin rump capicola, fatback spare ribs prosciutto leberkas. Biltong drumstick sausage swine pig. Drumstick spare ribs meatball shoulder venison frankfurter, landjaeger kevin swine pork chicken. Ribeye cupim tongue, doner drumstick jowl meatloaf pork.

          Shoulder beef t-bone landjaeger ground round biltong. Pork belly spare ribs fatback venison. Pork loin jerky rump tail corned beef shankle tri-tip fatback picanha flank bacon sausage porchetta sirloin. Kevin turkey pastrami beef ribs, ribeye burgdoggen boudin capicola jerky salami shank. Corned beef turkey turducken strip steak. Fatback drumstick ham, doner jerky landjaeger flank shank turducken strip steak sausage filet mignon ball tip ham hock.

          Biltong frankfurter corned beef, jowl picanha chicken shank pork loin jerky. Turkey spare ribs biltong doner, short loin brisket boudin alcatra tri-tip pork ball tip. Salami pork chop cow ribeye, corned beef meatloaf spare ribs t-bone shoulder. Swine ham hock strip steak, drumstick rump shoulder pork chicken pork chop salami short loin beef ribs alcatra hamburger. Jowl doner tri-tip cow ham meatloaf prosciutto landjaeger ground round pork belly turkey venison. Tri-tip brisket filet mignon tongue.

          Sausage flank sirloin drumstick. Porchetta picanha frankfurter chuck, short loin pork belly jerky pork loin beef ribs prosciutto ball tip rump tail pig. Ham hock bresaola shoulder leberkas. Drumstick pork belly shank burgdoggen.

          Swine kielbasa beef ribs, brisket meatloaf shankle spare ribs. Alcatra shankle rump, ham hock tri-tip pancetta chuck andouille prosciutto pork loin short loin kevin. Jowl ham hock short ribs chicken. Tenderloin landjaeger strip steak, brisket doner pork belly ham hock. Sirloin rump pork loin pig, tail pork chop burgdoggen turkey ball tip short ribs prosciutto ham tri-tip pork porchetta. Jerky strip steak shoulder, fatback biltong pig bresaola tenderloin corned beef boudin ribeye beef.
        </div>
      </div>
     
    // </div>
  )
}

class GamePage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      grid: [
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
    }
  }

  mouseDown = () => {

  }


  componentDidMount = () => {
    let handlers = document.querySelectorAll('.handler');
    var dragginHandler;
    var start;

    document.addEventListener('mousedown', function(e) {
      start = [e.clientX, e.clientY];
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


       // Get offset
       
      //  var containerOffsetLeft = wrapper.offsetLeft;

      //  // Get x-coordinate of pointer relative to container
      //  var pointerRelativeXpos = e.clientX - containerOffsetLeft;
 
      //  var dragSize = e.clientX - startX;
 

      if (document.defaultView.getComputedStyle(dragginHandler).cursor == 'ns-resize') {
        const combinedHeight = boxA.offsetHeight + boxB.offsetHeight;
        console.log('combinedHeight', combinedHeight, '=', boxA.offsetHeight, '+', boxB.offsetHeight,  '-', boxA.offsetTop)
        const totPercentage = parseInt(boxA.style.height.substr(0, boxA.style.height.length-1)) + parseInt(boxB.style.height.substr(0, boxB.style.height.length-1));
        console.log('totPercentage', totPercentage)
        const newHeight = ((e.clientY - boxA.offsetTop) / combinedHeight * totPercentage).toFixed(0);
        console.log('(', e.clientY, '-', boxA.offsetTop, ')', '/', combinedHeight, '*', totPercentage)
        console.log('newHeight', newHeight)
        console.log('newHeight2', totPercentage-newHeight)

        if (e.clientY - boxA.offsetTop < 200)
          return;

        boxA.style.height = `${newHeight}%`;
        boxB.style.height = `${totPercentage-newHeight}%`;

      } else {
        let rand = Math.floor(Math.random() * 100);
        boxA.style.width = `${rand}%`;
        boxB.style.width = `${100-rand}%`;

        console.log(boxB.offsetLeft)
        console.log(e.clientX)
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
          {gridBuilder(this.state.grid)}
        </div> */}


        <div className="wrapper" style={{backgroundColor: "#ccc", height: '100vh',  display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
          <div className="wrapper" style={{display: 'flex', flexDirection: 'row', height: '33%' }}>
            
            <div style={{display: 'flex', flexDirection: 'column', width: '20%'}}>
              <GameUITest/>
            </div>
            <div className={classNames(classes.handlerCol, "handler")}></div>
            <div style={{display: 'flex', flexDirection: 'column', width: '80%'}}>
              <GameUITest/>
            </div>

          </div>
          <div className={classNames(classes.handlerRow, "handler")}></div>
          <div className="wrapper" style={{display: 'flex', flexDirection: 'column', height: '33%', resize: 'vertical' }}>
            <GameUITest/>
          </div>
          <div className={classNames(classes.handlerRow, "handler")}></div>
          <div className="wrapper" style={{display: 'flex', flexDirection: 'column', height: '34%', resize: 'vertical' }}>
            <GameUITest/>
          </div>
        </div>


        {/* <div className={classNames(classes.wrapper, 'wrapper')}>
          <div className={classNames(classes.box, "box box-A")}>A</div>
          <div className={classNames(classes.handler, "handler handler-A")}></div>
          <div className={classNames(classes.box, "box box-B")}>B</div>
          <div className={classNames(classes.handler, "handler handler-B")}></div>
          <div className={classNames(classes.box, "box box-C")}>C</div>
        </div> */}

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

