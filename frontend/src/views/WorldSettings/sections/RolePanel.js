import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import UserPermissions from 'views/WorldSettings/sections/UserPermissions.js';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import RoleUserList from 'components/RoleUserList/RoleUserList.js';
import RoleService from 'services/RoleService.js';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Button from "@material-ui/core/Button";
import { toast } from 'react-toastify';

export default function RolePanel(props){
	const { children, users, value, index, setUsers , ...other } = props;
	const [roles, setRoles] = React.useState([]);
	const [rolekeys,setRolekeys] = React.useState([]);
	const [showDialog, setShowDialog] = React.useState(false);
	const [name, setName] = React.useState("");
	const handleClose = () => {
		setShowDialog(false);
	  };

	const confirm = () => {
		if(name===""){
			toast.error("Name cannot be empty!", {
				position: toast.POSITION.TOP_CENTER
			});
			return;
		}
		RoleService.addRole(1,name).then((res)=>{
			if(res.status!==200){
				toast.error("Something went wrong!", {
					position: toast.POSITION.TOP_CENTER
				});
				return null;
			}
			return res.json();
		})
		.then((res)=>{
			console.log(res);
			if(!res)
				return;
			setRoles([]);
			toast.success("Role added successfully!", {
				position: toast.POSITION.TOP_CENTER
			});
			setShowDialog(false)
		})
	};

	const handleChange = (event) => {
		setName(event.target.value);
	  };

	useEffect(()=>{
		console.log("useeffect")
		console.log(roles)
		if(roles.length===0){
			RoleService.getAllRoles(1)
			.then((res) => {
				return res.json();
			})
			.then((res) => {
				let newRoles = {};
				res.forEach((role)=>{
					newRoles[role.role_id]={"ban":role.ban,"chat":role.chat,"conference_manage":role.conference_manage,"invite":role.invite,"is_default":role.is_default,"name":role.name,"role_manage":role.role_manage,"talk":role.talk,"talk_conference":role.talk_conference,"walk":role.walk,"world_mute":role.world_mute};
				})
				setRoles(newRoles);
			});
		}
		else{
			let temp = []
			Object.keys(roles).forEach((key) => {
				console.log(key);
				console.log(roles[key])
				temp.push(
					<div id={"role" + key} key={"role"+key}>
						<RoleUserList setUsers={setUsers} roleName={roles[key].name} value={roles[key]} allRoles={Object.keys(roles)}/>
					</div>
				);
				console.log(temp)
				setRolekeys(temp);
			})
		}
	},[roles])



	return(
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Row style={{borderStyle:"solid", borderColor:"black", backgroundColor:"#5BC0BE", height:"450px", borderBottomLeftRadius:"15px", borderBottomRightRadius:"15px", borderTopRightRadius:"15px"}}>
					<Col xs={4} sm={4} md={4} style = {{borderRight:"1px solid black",height:"100%"}}>
						<Row style={{ height:"10%"}}>
							<TextField id="filled-search" label="Search user" type="search" variant="filled" style={{width:"100%"}}/>
						</Row>
						<hr/>
						<Row style={{overflowY:"auto", height:"65%"}}>
							<Col style={{marginLeft:"10px"}}>
								{rolekeys}
							</Col>
						</Row>
						<Row style={{cursor:"pointer", position:"absolute", bottom:"0", height:"15%", width:"100%",borderTop:"1px solid black"}} onClick={()=>{setShowDialog(true);}}>
							<Typography variant="h5" style={{margin:"auto"}}><AddIcon/>Add Role</Typography>
						</Row>
					</Col>
					<Col xs={8} sm={8} md={8}>
						<UserPermissions/>				
					</Col>
				</Row>
			)}
			<Dialog open={showDialog} onClose={handleClose} aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Add role</DialogTitle>
				<DialogContent>
					<TextField
					autoFocus
					margin="dense"
					id="name"
					label="Role Name"
					type="string"
					onChange={handleChange}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Cancel
					</Button>
					<Button onClick={confirm} color="primary">
						Add
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
