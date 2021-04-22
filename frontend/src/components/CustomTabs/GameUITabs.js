import React from "react";

// material-ui components
import { withStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
// core components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import { useDrag } from "react-dnd";

import DragTypes from "consts/DragTypes";

import styles from "assets/jss/my-kit-react/components/gameUITabsStyle.js";



const GameUITabs = (props) => {
  // const ref = React.useRef<HTMLDivElement>(null);
  const [value, setValue] = React.useState(0);

  const handleChange = (event, value) => {
    setValue(value);
  };
  const { classes, headerColor, plainTabs, tabs } = props;
console.log(classes);


  // const [{ opacity }, drag, preview] = useDrag(() => ({
	// 	type: DragTypes.CARD,
	// 	collect: (monitor) => ({
	// 		opacity: monitor.isDragging() ? 0.4 : 1,
	// 	}), 
	// }));

  const resizeStyles = {
    section: {
    
      /* for Firefox */
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
  }

  return (
    <Card plain={plainTabs} classes={{ ...classes.card }} style={{...resizeStyles.section}}> {/*ref={preview}*/}
      <CardHeader
        // ref={drag}
        classes={{ cardHeader: classes.cardHeader }}
        color={headerColor}
        plain={plainTabs}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          classes={{
            root: classes.tabsRoot,
            indicator: classes.displayNone
          }}
        >
          {tabs.map((prop, key) => (
              <Tab 
                // ref={drag}
                classes={{
                  root: classes.tabRootButton,
                  label: classes.tabLabel,
                  selected: classes.tabSelected,
                  wrapper: classes.tabWrapper
                }}
                key={key}
                label={prop.tabName}
              />
          ))}
        </Tabs>
      </CardHeader>
      <CardBody classes={{ cardBody: classes.cardBody }} style={{...resizeStyles.content, ...resizeStyles.scrollableContent }} >
        {tabs.map((prop, key) => {
          if (key === value) {
            return <div key={key}>{prop.tabContent}</div>;
          }
          return null;
        })}
      </CardBody>
    </Card>
  )
}
console.log(styles);
export default withStyles(styles)(GameUITabs);
