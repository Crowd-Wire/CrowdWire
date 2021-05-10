import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';



export default function UserPermissions() {
  const [state, setState] = React.useState(
    {obj_int: false, walk: false, talk: false, inv_users: false,
      write: false, conf_manage: false, talk_conf: false, role_manage:false}
  );

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <FormGroup style={{height:"100%"}}>
      <Row style={{height:"100%"}}>
        <Col xs={6} sm={6} md={6}>
          <Row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.obj_int}
                  onChange={handleChange}
                  name="obj_int"
                  color="primary"
                  />
                }
                label="Object Interaction"
                labelPlacement="end"
                style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
            />
          </Row>
          <Row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.walk}
                  onChange={handleChange}
                  name="walk"
                  color="primary"
                  />
                }
                label="Walk"
                labelPlacement="end"
                style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
            />

          </Row>
          <Row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.talk}
                  onChange={handleChange}
                  name="talk"
                  color="primary"
                  />
                }
                label="Talk"
                labelPlacement="end"
                style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
            />
          </Row>
          <Row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.inv_users}
                  onChange={handleChange}
                  name="inv_users"
                  color="primary"
                  />
                }
                label="Invite Users"
                labelPlacement="end"
                style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
            />
          </Row>
        </Col>
        <Col xs={6} sm={6} md={6}>
          <Row>
            <FormControlLabel
              control={
                <Checkbox
                checked={state.talk_conf}
                onChange={handleChange}
                name="talk_conf"
                color="primary"
                />
              }
              label="Talk Conference"
              labelPlacement="end"
              style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
            />
          </Row>
          <Row>
          <FormControlLabel
            control={
              <Checkbox
              checked={state.conf_manage}
              onChange={handleChange}
                name="conf_manage"
                color="primary"
              />
              }
              label="Conference Manage"
              labelPlacement="end"
              style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
            />
          </Row>
          <Row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.role_manage}
                  onChange={handleChange}
                  name="role_manage"
                  color="primary"
                />
              }
              label="Role Manage"
              labelPlacement="end"
              style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
            />
          </Row>
          <Row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.write}
                  onChange={handleChange}
                  name="write"
                  color="primary"
                />
              }
              label="Write in Chat"
              labelPlacement="end"
              style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
            />
          </Row>
        </Col>
      </Row>
    </FormGroup>
  );
}