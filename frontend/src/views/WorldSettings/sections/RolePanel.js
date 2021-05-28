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
	const { children, users, value, index , ...other } = props;
	const [roles, setRoles] = React.useState([]);
	const [rolekeys,setRolekeys] = React.useState([]);
	const [showDialog, setShowDialog] = React.useState(false);
	const [name, setName] = React.useState("");
	const [usersInRole, setUsersInRole] = React.useState([]);
	const [roleAmount, setRoleAmount] = React.useState(0);
	const [selectedRole, setSelectedRole] = React.useState({});
	const [roleId, setRoleId] = React.useState(-1);
	let roleUsers;

	const handleClose = () => {
		setShowDialog(false);
	};

	const setUsers = (item, rId) => {

		
		setUsersInRole(prevUsersInRole => {
			const usersInRole = {...prevUsersInRole};
			const userId = item.id;

			for (let [key, value] of Object.entries(usersInRole)) {
				if (value.user_id == userId) {
					value.role_id = Number(rId);
					break;
				}
			}

			let temp = [];

			console.log("UsersInRole Values", Object.values(usersInRole))
			Object.keys(roles).forEach((key) => {
				console.log("For role", key, ":")
				let roleUsers = [];
				for(let user of Object.values(usersInRole)){
					if(user.role_id===parseInt(key)){
						roleUsers.push(user);
					}
				}
				console.log("roleUsers", roleUsers)

				temp.push(
					<div id={key} key={key} index={key}>
						<RoleUserList selectRole={selectRole} roleId={key} setUsers={setUsers} roleName={roles[key].name} value={roleUsers} allRoles={Object.keys(roles)}/>
					</div>
				);
			});
			setRolekeys(temp);

			return usersInRole;
		})

		

		// setRoles(prevRoles => {

		// 	const roles = {...prevRoles};
		// 	let flag = false;
		// 	for (let [key, role] of Object.entries(roles)) {
		// 		console.log(role)
		// 		let users = usersInRole.map((user) => {});//value.users;	
		// 		for (let i=0; i < users.length; i++) {
		// 			if (users[i]['id'] == item.id) {
		// 				users.splice(i, 1);
		// 				flag = true;
		// 				break;
						
		// 			}
		// 		}
		// 		if (flag) break;
		// 	}
		// 	roles[rId].users.splice(0, 0, item);

		// 	return { roles };
		// })
	}

	const confirm = () => {
		if(name===""){
			toast.error("Name cannot be empty!", {
				position: toast.POSITION.TOP_CENTER
			});
			return;
		}
		RoleService.addRole(props.world,name).then((res)=>{
			if(res.status!==200){
				toast.error("Something went wrong!", {
					position: toast.POSITION.TOP_CENTER
				});
				return null;
			}
			return res.json();
		})
		.then((res)=>{
			if(!res)
				return;
			setRoles([]);
			toast.success("Role added successfully!", {
				position: toast.POSITION.TOP_CENTER
			});
			setShowDialog(false)
		});
	};

	const handleChange = (event) => {
		setName(event.target.value);
	};

	const selectRole = (key) =>{
		setSelectedRole(roles[key]);
		setRoleId(key)
	}

	useEffect(()=>{
		if(roles.length===0 && props.world.split("/").length===1){
			RoleService.getAllRoles(props.world)
			.then((res) => {
				return res.json();
			})
			.then((res) => {
				let newRoles = {};
				if(res.length!==undefined){
					res.forEach((role)=>{
						newRoles[role.role_id]={"ban":role.ban,"chat":role.chat,"conference_manage":role.conference_manage,"invite":role.invite,"is_default":role.is_default,"name":role.name,"role_manage":role.role_manage,"talk":role.talk,"talk_conference":role.talk_conference,"walk":role.walk,"world_mute":role.world_mute, "interact":role.interact};
					})
					setRoles(newRoles);
				}
			});
			RoleService.getWorldUsersWRoles(props.world)
			.then((res)=>{
				return res.json();
			})
			.then((res)=>{
				setRoleAmount(res.length)
				setUsersInRole(res);
			})
		}
		else if(roles && roles.length!==0 && usersInRole.length!== 0 && usersInRole.length === roleAmount){
			let temp = [];
			let flag = true;
			Object.keys(roles).forEach((key) => {
				if(flag){
					setSelectedRole(roles[key]);
					setRoleId(key)
					flag=false;
				}

				roleUsers = [];
				if(usersInRole.length){
					let i = 0;
					for(let user of usersInRole){
						if(user.role_id===parseInt(key)){
							roleUsers.push(user);
						}
						i++;
					}
				}
				console.log(roleUsers);
				temp.push(
					<div id={key} key={key}>
						<RoleUserList selectRole={selectRole} roleId={key} setUsers={setUsers} roleName={roles[key].name} value={roleUsers} allRoles={Object.keys(roles)}/>
					</div>
				);
				setRolekeys(temp);
			})
			setRoleAmount(0)
		}
		console.log(usersInRole, 'nofim')
	},[roles, props.world, usersInRole])



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
						<Row style={{overflowY:"auto", height:"80%"}}>
							<Col style={{marginLeft:"10px"}}>
								{rolekeys}
							</Col>
						</Row>
						<Row style={{cursor:"pointer", position:"absolute", bottom:"0", height:"15%", width:"100%",borderTop:"1px solid black"}} onClick={()=>{setShowDialog(true);}}>
							<Typography variant="h5" style={{margin:"auto"}}><AddIcon/>Add Role</Typography>
						</Row>
					</Col>
					<Col xs={8} sm={8} md={8}>
						<UserPermissions setRoles={setRoles} world_id={props.world} roleName={selectedRole} roleId={roleId}/>				
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
