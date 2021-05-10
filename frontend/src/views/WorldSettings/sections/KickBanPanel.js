import React from 'react';
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TextField from '@material-ui/core/TextField';
import Button from 'react-bootstrap/Button';


export default function KickBanPanel(props){
	const { children, users, reports, value, index, ...other } = props;
	let rows = [];
	let reportBoxes = [];


	for(let i=0; i<users.length; i++){
		rows.push(
			<Row 
				key={"user_"+i} style={{height:"40px", border:"solid #54B5B4 1px", borderRadius:"10px", marginTop:"3px", width:"98%", marginLeft:"1%"}}
			>
				<Typography variant="h6" style={{marginLeft:"30px", marginTop:"auto", marginBottom:"auto"}}>
					{users[i]}
				</Typography>
			</Row>
		);
	}
	for(let i=0; i<reports.length; i++){
		reportBoxes.push(
			<Row key={"report_box_"+i} style={{marginLeft:"auto",marginRight:"auto",height:"180px", width:"100%", borderBottom:"1px solid black"}}>
				<Typography style={{marginTop:"auto"}} variant="h5">{reports[i]['Reporter']}</Typography>
				<Row style={{backgroundColor:"#0B132B", height:"130px", width:"100%", margin:"auto"}}>
					<Typography variant="body1" style={{color:"white"}}>{reports[i]['Message']}</Typography>
				</Row>
			</Row>
		);
	}
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
					<Col xs={4} sm={4} md={4} style={{height:"100%", borderRight:"1px solid black"}}>
						<Row style={{ height:"10%"}}>
						<TextField id="filled-search" label="Search user" type="search" variant="filled" style={{width:"100%"}}/>
						</Row>
						<hr/>
						<Row style={{overflowY:"auto", height:"80%"}}>
							<Col>
								{rows}
							</Col>
						</Row>
					</Col>
					<Col xs={8} sm={8} md={8} style={{height:"100%"}}>
						<Row style={{ height:"10%"}}>
							<Typography variant="h5" style={{marginTop:"10px", marginLeft:"10px"}}>Requests:</Typography>
						</Row>
						<hr/>
							<Row style={{height:"70%"}}>
								<Col style={{height:"100%", width:"100%", overflowY:"auto"}}>
									{reportBoxes}
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
