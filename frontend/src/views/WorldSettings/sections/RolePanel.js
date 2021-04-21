import React from 'react';
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import UserPermissions from 'views/WorldSettings/sections/UserPermissions.js';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import RoleUserList from 'components/RoleUserList/RoleUserList.js';

export default function RolePanel(props){
	const { children, users, roles,value, index, setUsers , ...other } = props;
	let rows = [];
	let rolekeys = [];

	Object.keys(roles).forEach(function(key) {
		rolekeys.push(
			<div id="context">
				<RoleUserList setUsers={setUsers} roleName={key} value={roles[key]} allRoles={Object.keys(roles)}/>
			</div>
		);
	});
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
						<Row style={{position:"absolute", bottom:"0", height:"15%", width:"100%",borderTop:"1px solid black"}}>
							<Typography variant="h5" style={{margin:"auto"}}><AddIcon/>Add Role</Typography>
						</Row>
					</Col>
					<Col xs={8} sm={8} md={8}>
						<UserPermissions/>				
					</Col>
				</Row>
			)}
		</div>
	);
}
