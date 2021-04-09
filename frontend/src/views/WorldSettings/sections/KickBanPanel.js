import React from 'react';
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AddIcon from '@material-ui/icons/Add';
import UserPermissions from 'views/WorldSettings/sections/UserPermissions.js';
import TextField from '@material-ui/core/TextField';
import CheckIcon from '@material-ui/icons/Check';
import Button from 'react-bootstrap/Button';


export default function KickBanPanel(props){
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
				<Row style={{borderStyle:"solid", borderColor:"black", backgroundColor:"#5BC0BE", height:"450px", borderBottomLeftRadius:"15px", borderBottomRightRadius:"15px", borderTopRightRadius:"15px"}}>
					<Col md={3} style={{height:"100%", borderRight:"1px solid black"}}>
						<Row style={{ height:"10%"}}>
							<Typography variant="h5" style={{marginTop:"10px", marginLeft:"10px"}}>Users:</Typography>
						</Row>
						<hr/>
						<Row style={{overflowY:"auto", height:"80%"}}>
							<Col>
								<Row style={{height:"50px"}}>
									<Typography variant="h5" style={{marginLeft:"10px", marginTop:"auto", marginBottom:"auto"}}>{children}</Typography>
								</Row>
								<Row style={{height:"50px"}}>
									<Typography variant="h5" style={{marginLeft:"10px", marginTop:"auto", marginBottom:"auto"}}>{children}</Typography>
								</Row>
								<Row style={{height:"50px"}}>
									<Typography variant="h5" style={{marginLeft:"10px", marginTop:"auto", marginBottom:"auto"}}>{children}</Typography>
								</Row>
								<Row style={{height:"50px"}}>
									<Typography variant="h5" style={{marginLeft:"10px",  marginTop:"auto", marginBottom:"auto"}}>{children}</Typography>
								</Row>
								<Row style={{height:"50px"}}>
									<Typography variant="h5" style={{marginLeft:"10px",  marginTop:"auto", marginBottom:"auto"}}>{children}</Typography>
								</Row>
								<Row style={{height:"50px"}}>
									<Typography variant="h5" style={{marginLeft:"10px",  marginTop:"auto", marginBottom:"auto"}}>{children}</Typography>
								</Row>
								<Row style={{height:"50px"}}>
									<Typography variant="h5" style={{marginLeft:"10px",  marginTop:"auto", marginBottom:"auto"}}>{children}</Typography>
								</Row>
								<Row style={{height:"50px"}}>
									<Typography variant="h5" style={{marginLeft:"10px",  marginTop:"auto", marginBottom:"auto"}}>{children}</Typography>
								</Row>
							</Col>
						</Row>
					</Col>
					<Col style={{height:"100%"}}>
						<Row style={{ height:"10%"}}>
							<Typography variant="h5" style={{marginTop:"10px", marginLeft:"10px"}}>Requests:</Typography>
						</Row>
						<hr/>
							<Row style={{height:"70%"}}>
								<Col style={{height:"100%", width:"100%", overflowY:"auto"}}>
									<Row style={{marginLeft:"auto",marginRight:"auto",height:"180px", width:"100%", borderBottom:"1px solid black"}}>
										<Typography style={{marginTop:"auto"}} variant="h5">Sílvia</Typography>
										<Row style={{backgroundColor:"#0B132B", height:"130px", width:"100%", margin:"auto"}}>
											<Typography variant="body1" style={{color:"white"}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac mauris sit amet odio elementum euismod nec ac enim. Cras eu sem sit amet est hendrerit tempor. Duis lectus ipsum, auctor ac ultrices ac, egestas at velit.</Typography>
										</Row>
									</Row>
									<Row style={{marginLeft:"auto",marginRight:"auto",height:"180px", width:"100%", borderBottom:"1px solid black"}}>
										<Typography style={{marginTop:"auto"}} variant="h5">Sílvia</Typography>
										<Row style={{backgroundColor:"#0B132B", height:"130px", width:"100%", margin:"auto"}}>
											<Typography variant="body1" style={{color:"white"}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac mauris sit amet odio elementum euismod nec ac enim. Cras eu sem sit amet est hendrerit tempor. Duis lectus ipsum, auctor ac ultrices ac, egestas at velit.</Typography>
										</Row>
									</Row>
									<Row style={{marginLeft:"auto",marginRight:"auto",height:"180px", width:"100%", borderBottom:"1px solid black"}}>
										<Typography style={{marginTop:"auto"}} variant="h5">Sílvia</Typography>
										<Row style={{backgroundColor:"#0B132B", height:"130px", width:"100%", margin:"auto"}}>
											<Typography variant="body1" style={{color:"white"}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac mauris sit amet odio elementum euismod nec ac enim. Cras eu sem sit amet est hendrerit tempor. Duis lectus ipsum, auctor ac ultrices ac, egestas at velit.</Typography>
										</Row>
									</Row>
								</Col>
							</Row>
							<Row style={{marginTop:"3px", height:"12%", backgroundColor:"#0B132B"}}>
								<Button variant="success" size="sm" style={{height:"80%", minWidth:"70px", marginRight:"10px", marginLeft:"15px", marginTop:"auto",marginBottom:"auto"}}>Dismiss</Button>{' '}
								<Button variant="warning" size="sm" style={{height:"80%", minWidth:"70px", marginRight:"10px", marginTop:"auto",marginBottom:"auto"}}>Kick</Button>{' '}
								<Button variant="danger" size="sm" style={{height:"80%", minWidth:"70px", marginRight:"10px", marginTop:"auto",marginBottom:"auto"}}>Ban</Button>{' '}
							</Row>
					</Col>
				</Row>
			)}
		</div>
	);
}
