import React, { useEffect } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import RoleService from 'services/RoleService.js';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

export default function UserPermissions(props) {
  const classes = useStyles();
  const [newState, setNewState] = React.useState(
    {name:false,ban: false, obj_int: false, walk: false, talk: false, inv_users: false,
      chat: false, conf_manage: false, talk_conf: false, role_manage:false, world_mute:false, is_default:false}
  );
  const [dialog,setDialog] = React.useState(false);

  const [changed, setChanged] = React.useState(false);
  const handleChange = (event) => {
    setNewState({ ...newState, [event.target.name]: event.target.checked });
    setChanged(true);
  };
  
  const handleClose = () => {
    setDialog(false)
    setChanged(false)
  }

  const changeNameAndClose = (newName) => {
    setNewState({...newState, name: newName});
    setDialog(false);
    setChanged(true);


  }

  const deleteRole = () => {
    if(props.world_id.length===1){
      props.setRoles([]);
      RoleService.deleteRole(props.world_id, props.roleId);
    }
  }

  const saveInfo = () => {
    console.log(newState)
    if(props.world_id.length===1)
      RoleService.editRole(props.world_id,newState,props.roleId)
      .then((res)=>{
        console.log(res.status)
        return res.json();
      })
      .then((res)=>{
        console.log(res);
        props.setRoles([]);
      });
  }

  useEffect(()=>{
    setChanged(false);
    setNewState({name: props.roleName.name, ban: props.roleName.ban, obj_int: props.roleName.interact, walk:props.roleName.walk, talk: props.roleName.talk, inv_users: props.roleName.invite, chat: props.roleName.chat, conf_manage: props.roleName.conference_manage, talk_conf: props.roleName.talk_conference, role_manage: props.roleName.role_manage, world_mute: props.roleName.world_mute, is_default:props.roleName.is_default})
  },[props.roleName])

  return (
    <FormGroup style={{height:"100%"}}>
      <Row style={{paddingLeft:"30px", paddingRight:"30px"}}>
      <Typography onClick={()=>setDialog(true)} variant="h4" style={{cursor:"pointer", paddingTop:"10px", paddingBottom:"10px"}}>
        {newState.name}
      </Typography>
      <Typography variant="caption" style={{marginTop:"auto", marginBottom:"auto", marginLeft:"15px"}}>
        (click to edit)
      </Typography>
      </Row>
      <Row style={{height:"70%"}}>
        <Col xs={6} sm={6} md={6}>
          <Row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newState.obj_int}
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
                  checked={newState.walk}
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
                  checked={newState.talk}
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
                  disabled={newState.is_default}
                  checked={newState.inv_users}
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
          <Row>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={newState.is_default}
                  checked={newState.ban}
                  onChange={handleChange}
                  name="ban"
                  color="primary"
                  />
                }
                label="Ban Users"
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
                checked={newState.talk_conf}
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
                checked={newState.world_mute}
                onChange={handleChange}
                name="world_mute"
                color="primary"
                />
              }
              label="Mute World"
              labelPlacement="end"
              style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
            />
          </Row>
          <Row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newState.write}
                  onChange={handleChange}
                  name="chat"
                  color="primary"
                />
              }
              label="Write in Chat"
              labelPlacement="end"
              style={{color:"black", float:"left", marginLeft:"10px", minWidth:"110px"}}
            />
          </Row>
          <Row>
          <FormControlLabel
            control={
              <Checkbox
                disabled={newState.is_default}
                checked={newState.conf_manage}
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
                  disabled={newState.is_default}
                  checked={newState.role_manage}
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
        </Col>
      </Row>
      <Row>
        <Col sm={0} md={4} lg={6}>
        </Col>
        <Col sm={6} md={4} lg={3}>
          <Button
            onClick={(saveInfo)}
            size="small"
            style={{marginTop:"auto", marginBottom:"auto"}}
            disabled={!changed}
            variant="outlined"
            color="primary"
            className={classes.button}
            startIcon={<SaveIcon />}
          >
            Change
          </Button>
        </Col>
        <Col sm={6} md={4} lg={3}>
          <Button
            disabled={newState.is_default}
            onClick={()=>deleteRole()}
            size="small"
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
      <Dialog open={dialog} onClose={handleClose} aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Add role</DialogTitle>
				<DialogContent>
					<TextField
					autoFocus
					margin="dense"
          id="name"
					label="Role Name"
					type="string"
					/>
				</DialogContent>
				<DialogActions>
					<Button color="primary" onClick={handleClose}>
						Cancel
					</Button>
					<Button color="primary" onClick={()=>changeNameAndClose(document.getElementById("name").value)}>
						Change
					</Button>
				</DialogActions>
			</Dialog>
    </FormGroup>
  );
}