import customTabsStyle from "assets/jss/material-kit-react/components/customTabsStyle.js";

const gameUITabsStyle = {
  ...customTabsStyle,
  card: {
    backgroundColor: "rgba(200, 200, 200, .3)",
    margin: 0,
    flexGrow: '1',
      
    display: 'flex',
    flexDirection: 'column',
    
    /* for Firefox */
    minHeight: '0',
  },
  cardHeader: {
    padding: "3px 0 0 0",
    margin: "0",
    borderRadius: "3px 3px 0 0",
    boxShadow: "none"
  },
  cardBody: {
    padding: 0,
    overflow: 'auto',
    minHeight: 0, // for Firefox
    // flexGrow: 1
  },
  tabRootButton: {
    minHeight: "unset !important",
    minWidth: "unset !important",
    width: "unset !important",
    height: "unset !important",
    maxWidth: "unset !important",
    maxHeight: "unset !important",
    borderRadius: "3px 3px 0 0",
    lineHeight: "6px",
    backgroundColor: "rgba(9, 25, 33, .5) !important",
    border: "0 !important",
    color: "#fff !important",
    fontWeight: "500",
    fontSize: "12px",
    "&:first-child": {
      marginLeft: "4px"
    }
  },
  tabSelected: {
    backgroundColor: "rgba(9, 25, 33, 1)",
    transition: "0.2s background-color 0.1s"
  },
};

export default gameUITabsStyle;
