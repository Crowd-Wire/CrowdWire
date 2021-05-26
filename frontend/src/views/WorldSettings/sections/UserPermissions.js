import React, { useEffect } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import InputBase from '@material-ui/core/InputBase';


const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

export default function UserPermissions(props) {
  const classes = useStyles();

  const [state, setState] = React.useState(
    {ban: false, obj_int: false, walk: false, talk: false, inv_users: false,
      chat: false, conf_manage: false, talk_conf: false, role_manage:false}
      );
  const [name, setName] = React.useState("");
  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };
  
  useEffect(()=>{
    setName(props.roleName.name);
    setState({ban: props.roleName.ban, walk:props.roleName.walk, talk: props.roleName.talk, inv_users: props.roleName.invite, chat: props.roleName.chat, conf_manage: props.roleName.conference_manage, talk_conf: props.roleName.talk_conference, role_manage: props.roleName.role_manage})
    console.log(props.roleName);
  },[props.roleName, name])

  return (
    <FormGroup style={{height:"100%"}}>
      <Row>
      <InputBase
          className={classes.button}
          defaultValue={name}
          inputProps={{ 'aria-label': 'naked' }}
      />
      </Row>
      <Row style={{height:"75%"}}>
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
      <Row>
        <Col md={9}>
        </Col>
        <Col>
          <Button
          style={{marginTop:"auto", marginBottom:"auto"}}
            variant="contained"
            color="secondary"
            className={classes.button}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </Col>
      </Row>
    </FormGroup>
  );
}