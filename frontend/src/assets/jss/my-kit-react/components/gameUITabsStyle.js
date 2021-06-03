import customTabsStyle from "assets/jss/material-kit-react/components/customTabsStyle.js";

const gameUITabsStyle = {
  ...customTabsStyle,
  card: {
    boxSizing: 'border-box',
    padding: '5px',
    backgroundColor: "rgba(11, 19, 43, 0.8)",
    borderRadius: '0 !important',
    margin: 0,
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '0', // for Firefox
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
    flexGrow: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    "&::-webkit-scrollbar-track": {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.3)',
      backgroundColor: 'transparent',
    },
    "&::-webkit-scrollbar": {
      backgroundColor: 'transparent',
      width: 12,
      height: 12,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: 'rgb(11, 19, 43)',
    }
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
    backgroundColor: "rgba(11, 19, 43, 0.5) !important",
    border: "0 !important",
    color: "#fff !important",
    fontWeight: "500",
    fontSize: "12px",
  },
  tabSelected: {
    backgroundColor: "rgba(11, 19, 43, 1) !important",
    transition: "0.2s background-color 0.1s"
  },
};

export default gameUITabsStyle;
