import React from "react";

// material-ui components
import { withStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
// core components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import CloseIcon from '@material-ui/icons/Close';

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

  // const [{ opacity }, drag, preview] = useDrag(() => ({
	// 	type: DragTypes.CARD,
	// 	collect: (monitor) => ({
	// 		opacity: monitor.isDragging() ? 0.4 : 1,
	// 	}), 
	// }));

  return (
    <Card plain={plainTabs} classes={{ card: classes.card }} > {/*ref={preview}*/}
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
                label={
                  <>
                    {prop.tabName}
                    {/* {value === key && <CloseIcon onClick={() => console.log('close')} />} */}
                  </>
                }
              />
          ))}
        </Tabs>
      </CardHeader>
      <CardBody classes={{ cardBody: classes.cardBody }} >
        {tabs[value].tabContent}
      </CardBody>
    </Card>
  )
}

export default withStyles(styles)(GameUITabs);
