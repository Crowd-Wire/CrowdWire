import React from "react";

import style from "assets/jss/my-kit-react/views/WorldEditorPage/editorNavbarStyle";
import { withStyles } from '@material-ui/core/styles';

import Dropdown from 'react-bootstrap/Dropdown';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

import { withRouter } from "utils/wrapper.js";

import useWorldEditorStore from 'stores/useWorldEditorStore';


class EditorNavbar extends React.Component {
  state = {
    highlight: false,
    grid: false,
  }

  handleChange = (event) => {
    const name = event.target.name;
    const value = !this.state[name];

    console.log(name, value)

    this.setState({ [name]: value });
    useWorldEditorStore.getState().setState({ [name]: value });
  }

  render() {
    const { classes } = this.props;
    const { highlight, grid } = this.state;

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
      <div
        ref={ref}
        className={classes.navbarItem}
        onClick={(e) => { e.preventDefault(); onClick(e); }}
      >
        {children}
      </div>
    ));

    return (
      <div className={classes.navbar} style={{ display: 'flex' }}>
        <div className={classes.navbarItem}>Help</div>
        <Dropdown
          menuAlign="right"
          title="Dropdown right"
        >
          <Dropdown.Toggle as={CustomToggle}>View</Dropdown.Toggle>
          <Dropdown.Menu style={{ backgroundColor: 'rgb(11, 19, 43)' }}>

            <Dropdown.Item className={classes.dropdownItem} eventKey="1">
              Zoom In <span>Q</span>
            </Dropdown.Item>
            <Dropdown.Item className={classes.dropdownItem} eventKey="2">
              Zoom Out <span>E</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className={classes.dropdownItem} eventKey="3" name="grid" onClick={this.handleChange}>
              Show Grid {grid ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
            </Dropdown.Item>
            <Dropdown.Item className={classes.dropdownItem} eventKey="4" name="highlight" onClick={this.handleChange}>
              Highlight Selected Layers {highlight ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <div style={{ flexGrow: 1 }}></div>
        <div className={classes.navbarItem}>Save</div>
        <div className={classes.navbarItem}>Exit</div>
      </div>
    )
  }
}

export default withRouter(withStyles(style)(EditorNavbar));
