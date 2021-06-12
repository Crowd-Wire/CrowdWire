import React, { useEffect } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TextField from '@material-ui/core/TextField';
import Button from 'react-bootstrap/Button';
import WorldService from 'services/WorldService';
import UserService from 'services/UserService';
import UserReportCard from 'components/UserReportCard/UserReportCard';


const useStyles = makeStyles((theme) => ({
	selected: {
	  backgroundColor:"#54B5B4",
	},
  }));

export default function KickBanPanel(props){
	const classes = useStyles();
	const { children, reports, value, index, ...other } = props;
	const [selectedElement, setSelectedElement] = React.useState(0);
	const [worldUsers, setWorldUsers] = React.useState([]);
	const [reportBoxes, setReportBoxes] = React.useState([])
	const [rows, setRows] = React.useState([]);
	const settingSelElement = (key) => {
		console.log(key)
		setSelectedElement(Number.parseInt(key))
	};

	useEffect(() => {
		if(props.world.length===1)
			WorldService.getAllWorldUsers(props.world)
			.then((res) => {
				return res.json();
			})
			.then((res) => {
				let flag = true;
				let users = {};
				if(res.length!==undefined){
					res.forEach((worldUsers)=>{
						users[worldUsers.user_id]={"avatar":worldUsers.avatar,"role_id":worldUsers.role_id,"username":worldUsers.username};
						if(flag){
							setSelectedElement(worldUsers.user_id)
							flag=false;
						}
					})
					setWorldUsers(users);
				}
			});
	},[props.world])

	useEffect(() => {
		let userRows = [];
		Object.keys(worldUsers).forEach((key) => {
			if(worldUsers.length !== 0){
				userRows.push(
					<Row
						onClick={()=>{settingSelElement(key)}}
						className={ selectedElement === Number.parseInt(key) ? classes.selected : null }
						id={key} key={"user_"+key} style={{height:"40px", border:"solid #54B5B4 1px", borderRadius:"10px", marginTop:"3px", width:"98%", marginLeft:"1%"}}
					>
						<Typography variant="h6" style={{marginLeft:"10px", marginTop:"auto", marginBottom:"auto"}}>
							{worldUsers[key].username}
						</Typography>
						<Typography variant="caption" style={{marginLeft:"5px"}}>
							<em>#{key}</em>
						</Typography>
					</Row>
				);
				console.log(document.getElementById("1"))
			}
		});
		setRows(userRows);
	}, [worldUsers])

	useEffect(()=>{
		let newReportBoxes = [];
		console.log("selectedElements")
		if(selectedElement>=0){
			UserService.getUserReports(props.world, null, selectedElement, null, null, null, null, null, null)
			.then((res)=>{
				return res.json();
			})
			.then((res)=>{
				console.log(res)
				if(res.length>0)
				for(let i=0; i<res.length; i++){
					newReportBoxes.push(
						<UserReportCard 
							key={res[i].reporter + '_' + res[i].reported + '_' + res[i].world_id + '_' + res[i].reviewed}
							report={res[i]}
						/>
					);
				}
				setReportBoxes(newReportBoxes);
			})
		}
	},[selectedElement])
	
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
