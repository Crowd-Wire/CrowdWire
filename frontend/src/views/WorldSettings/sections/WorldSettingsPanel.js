import React from 'react';
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AddIcon from '@material-ui/icons/Add';
import UserPermissions from 'views/WorldSettings/sections/UserPermissions.js';



export default function WorldSettingsPanel(props){
	const { children, value, index, ...other } = props;
	console.log(index+","+value+children);
	return(
		<div
		role="tabpanel"
		hidden={value !== index}
		id={`simple-tabpanel-${index}`}
		aria-labelledby={`simple-tab-${index}`}
		style={{height:"100%"}}
		{...other}
		>
			{value === index && (
				<Row style={{borderStyle:"solid", borderColor:"black", backgroundColor:"#5BC0BE", minHeight:"400px", borderBottomLeftRadius:"15px", borderBottomRightRadius:"15px", borderTopRightRadius:"15px"}}>
					<Col md={3} style = {{borderRight:"1px solid black"}}>
						<Row style={{ height:"10%"}}>
							<Typography variant="h5" style={{marginTop:"10px"}}>Roles:</Typography>
						</Row>
						<hr/>
						<Row style={{overflowY:"auto", height:"65%"}}>
							<Col style={{marginLeft:"10px"}}>
								<Row style={{marginTop:"5px"}}>
									<Typography variant="h6">{children}</Typography>
								</Row>
								<Row style={{marginTop:"5px"}}> 
									<Typography variant="h6">Speaker</Typography>
								</Row>
								<Row style={{marginTop:"5px"}}> 
									<Typography variant="h6">Staff</Typography>
								</Row>
								<Row style={{marginTop:"5px"}}>
									<Typography variant="h6">Admin</Typography>
								</Row>
								<Row style={{marginTop:"5px"}}> 
									<Typography variant="h6">Speaker</Typography>
								</Row>
							</Col>
						</Row>
						<Row style={{position:"absolute", bottom:"0", height:"15%", width:"100%",borderTop:"1px solid black"}}>
							<Typography variant="h5" style={{margin:"auto"}}><AddIcon/>Add Role</Typography>
						</Row>
					</Col>
					<Col>
						<Row>
							<UserPermissions/>				
						</Row>
					</Col>
					<Col>
						
					</Col>
				</Row>
			)}
		</div>
	);
}
