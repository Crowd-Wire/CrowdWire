import React from "react";

import style from "assets/jss/my-kit-react/views/WorldEditorPage/editorNavbarStyle";
import { withStyles } from '@material-ui/core/styles';
import classNames from "classnames";

import Dropdown from 'react-bootstrap/Dropdown';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

import { toast } from 'react-toastify';
import { withRouter } from "utils/wrapper.js";

import MapManager from "phaser/MapManager.ts";
import useWorldEditorStore from 'stores/useWorldEditorStore';


class EditorNavbar extends React.Component {
  subscriptions = [];
  askSave = true;

  state = {
    highlight: false,
    grid: false,
    save: false,
  }

  constructor(props) {
    super(props);
    this.navigate = props.navigate;
  }

  componentDidMount() {
    if (useWorldEditorStore.getState().ready)
      this.handleReady();
    else
      this.subscriptions.push(useWorldEditorStore.subscribe(
        this.handleReady, state => state.ready));

    this.subscriptions.push(useWorldEditorStore.subscribe(
      (save) => { this.setState({ save }); this.askSave = save; }, state => state.save));
  }

  componentWillUnmount() {
    this.subscriptions.forEach((unsub) => unsub());
  }

  handleReady = () => {
    this.mapManager = new MapManager();
  }

  handleSave = async () => {
    await this.mapManager?.saveMap()
      .then(() => {
        toast.success("World saved with success!", {
          position: toast.POSITION.TOP_CENTER
        });
        useWorldEditorStore.getState().setState({ save: false });
      });
  }

  handleExit = () => {
    if (this.state.save && this.askSave) {
      toast.warning("Don't forget to save before exiting!", {
        position: toast.POSITION.TOP_CENTER,
        toastId: 'toast-save'
      });
      this.askSave = false;
    } else {
      this.navigate("/dashboard/search");
    }
  }

  handleChange = (event) => {
    const name = event.target.name;
    const value = !this.state[name];

    this.setState({ [name]: value });
    useWorldEditorStore.getState().setState({ [name]: value });
  }

  render() {
    const { classes } = this.props;
    const { highlight, grid, save } = this.state;

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
        <Dropdown
          menuAlign="right"
          title="Dropdown right"
        >
          <Dropdown.Toggle as={CustomToggle}>World</Dropdown.Toggle>
          <Dropdown.Menu style={{ backgroundColor: 'rgb(11, 19, 43)' }}>
            <Dropdown.Item className={classes.dropdownItem} eventKey="1">
              New Blank World
            </Dropdown.Item>
            <Dropdown.Item className={classes.dropdownItem} eventKey="1">
              Resize World
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
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
            <Dropdown.Item
              className={classes.dropdownItem} eventKey="3" name="grid"
              onClick={this.handleChange}
            >
              Show Grid
              {grid ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
            </Dropdown.Item>
            <Dropdown.Item
              className={classes.dropdownItem} eventKey="4" name="highlight"
              onClick={this.handleChange}
            >
              Highlight Selected Layers
              {highlight ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <div style={{ flexGrow: 1 }}></div>
        <div
          className={classNames(classes.navbarItem, { [classes.navbarItemDisable]: !save })}
          onClick={() => { save && this.handleSave() }}
        >
          Save
        </div>
        <div className={classes.navbarItem} onClick={this.handleExit}>Exit</div>
      </div>
    )
  }
}

export default withRouter(withStyles(style)(EditorNavbar));
