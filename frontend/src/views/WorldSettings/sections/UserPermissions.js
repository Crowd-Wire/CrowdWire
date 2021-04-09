import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';



export default function UserPermissions() {
  const [state, setState] = React.useState({

    checkedG: true,
  });

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <FormGroup style={{height:"100%"}}>
      <Row style={{height:"100%"}}>
        <Col md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={state.checkedB}
                onChange={handleChange}
                name="checkedB"
                color="primary"
                />
              }
              label="Deafen"
              labelPlacement="start"
              style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
          />
                <FormControlLabel
            control={
              <Checkbox
                checked={state.checkedB}
                onChange={handleChange}
                name="checkedB"
                color="primary"
                />
              }
              label="Mute"
              labelPlacement="start"
              style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
          />
        </Col>
        <Col md={6}>
        <FormControlLabel
            control={
              <Checkbox
                checked={state.checkedB}
                onChange={handleChange}
                name="checkedB"
                color="primary"
                />
              }
              label="Global Chat"
              labelPlacement="start"
              style={{color:"black", margin:"auto"}}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={state.checkedB}
                onChange={handleChange}
                name="checkedB"
                color="primary"
                />
              }
              label="Edit World Settings"
              labelPlacement="start"
              style={{color:"black", margin:"auto"}}
          />
        </Col>
      </Row>
    </FormGroup>
  );
}