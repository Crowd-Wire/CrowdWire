import React from 'react';
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import UserPermissions from 'views/WorldSettings/sections/UserPermissions.js';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';

export default function RolePanel(props){
	const { children, users, roles,value, index, ...other } = props;
	console.log(index+","+value+children);
	let rows = [];
	let rolekeys = [];
    for(let i=0; i<users.length; i++){
      rows.push(
		<Row style={{height:"50px"}}>
			<Typography variant="h4" style={{marginLeft:"10px",fontSize:"2em", marginTop:"auto", marginBottom:"auto"}}>{users[i]}</Typography>
			<CheckIcon style={{marginTop:"auto", marginBottom:"auto", float:"right"}}/>
		</Row>
	  );
    }
	Object.keys(roles).forEach(function(key) {
		console.log(key,roles[key]);
		rolekeys.push(
			<Row style={{marginTop:"5px"}}>
				<Typography variant="h5">{key}</Typography>
			</Row>
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
					<Col xs={3} sm={3} md={3} style = {{borderRight:"1px solid black",height:"100%"}}>
						<Row style={{ height:"10%"}}>
							<Typography variant="h5" style={{marginTop:"10px", marginLeft:"10px"}}>Roles:</Typography>
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
					<Col xs={6} sm={6} md={6}>
						<UserPermissions/>				
					</Col>
					<Col xs={3} sm={3} md={3} style={{height:"100%", borderLeft:"solid 1px black"}}>
						<Row style={{ height:"10%"}}>
							<TextField id="filled-search" label="Search field" type="search" variant="filled" style={{width:"100%"}}/>
							{/* <Typography variant="h5" style={{marginLeft:"10px", marginTop:"10px"}}>Users:</Typography> */}
						</Row>
						<hr/>
						<Row style={{overflowY:"auto", height:"80%"}}>
							<Col>
								{rows}
							</Col>
						</Row>
					</Col>
				</Row>
			)}
		</div>
	);
}
