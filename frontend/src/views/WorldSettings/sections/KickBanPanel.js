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
import { toast } from 'react-toastify';


const useStyles = makeStyles((theme) => ({
	selected: {
	  backgroundColor:"#54B5B4",
	},
	selectedDeleted: {
		backgroundColor:"#f5e900",
	},
	selectedBanned: {
		backgroundColor:"#e01212",
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
						console.log(worldUsers)
						users[worldUsers.user_id]={"avatar":worldUsers.avatar,"role_id":worldUsers.role_id,"username":worldUsers.username, "status": worldUsers.status};
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
				if(Number.parseInt(worldUsers[key].status)===0)
					userRows.push(
						<Row
							onClick={()=>{settingSelElement(key)}}
							className={ selectedElement === Number.parseInt(key) ? classes.selected : null }
							id={key} key={"user_"+key} style={{height:"40px", border:"solid #54B5B4 1px", borderRadius:"10px", marginTop:"3px", width:"98%", marginLeft:"1%", cursor:"pointer"}}
						>
							<Typography variant="h6" style={{marginLeft:"10px", marginTop:"auto", marginBottom:"auto"}}>
								{worldUsers[key].username}
							</Typography>
							<Typography variant="caption" style={{marginLeft:"5px"}}>
								<em>#{key}</em>
							</Typography>
						</Row>
					);
				if(Number.parseInt(worldUsers[key].status)===1)
					userRows.push(
						<Row
							onClick={()=>{settingSelElement(key)}}
							className={ selectedElement === Number.parseInt(key) ? classes.selectedBanned : null }
							id={key} key={"user_"+key} style={{height:"40px", border:"solid #e01212 1px", borderRadius:"10px", marginTop:"3px", width:"98%", marginLeft:"1%", cursor:"pointer"}}
						>
							<Typography variant="h6" style={{marginLeft:"10px", marginTop:"auto", marginBottom:"auto"}}>
								{worldUsers[key].username}
							</Typography>
							<Typography variant="caption" style={{marginLeft:"5px"}}>
								<em>#{key}</em>
							</Typography>
						</Row>
					);
				if(Number.parseInt(worldUsers[key].status)===2)
					userRows.push(
						<Row
							onClick={()=>{settingSelElement(key)}}
							className={ selectedElement === Number.parseInt(key) ? classes.selectedDeleted : null }
							id={key} key={"user_"+key} style={{height:"40px", border:"solid #f5e900 1px", borderRadius:"10px", marginTop:"3px", width:"98%", marginLeft:"1%", cursor:"pointer"}}
						>
							<Typography variant="h6" style={{marginLeft:"10px", marginTop:"auto", marginBottom:"auto"}}>
								{worldUsers[key].username}
							</Typography>
							<Typography variant="caption" style={{marginLeft:"5px"}}>
								<em>#{key}</em>
							</Typography>
						</Row>
					);
			}
		});
		setRows(userRows);
	}, [worldUsers, selectedElement])

	useEffect(()=>{
		let newReportBoxes = [];
		if(selectedElement>=0){
			UserService.getUserReports(props.world, null, selectedElement, null, null, null, null, null, null)
			.then((res)=>{
				return res.json();
			})
			.then((res)=>{
				if(res.length>0){
					for(let i=0; i<res.length; i++){
						res[i].world_name = res[i].comment;
						newReportBoxes.push(
							<UserReportCard 
								key={res[i].reporter + '_' + res[i].reported + '_' + res[i].world_id + '_' + res[i].reviewed}
								report={res[i]}
							/>
						);
					}
					setReportBoxes(newReportBoxes);
				}
				else{
					setReportBoxes(<Typography variant="h5">No unreviewed reports for this user</Typography>);
				}
			})
		}
	},[selectedElement])
	
	const changeStatus = ( status ) => {
		WorldService.changeUserStatus(props.world,selectedElement, status)
		.then((res)=>{
			return res.json();
		})
		.then((res)=>{
			if(res.status===status)
				if(res.status===1){
					toast.success("User was banned successfully!", {
						position: toast.POSITION.TOP_CENTER
					});		
				}
				else if(res.status===2){
					toast.success("User was deleted successfully!", {
						position: toast.POSITION.TOP_CENTER
					});
				}
		})
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
				<Row style={{borderStyle:"solid", borderColor:"black", height:"450px", borderBottomLeftRadius:"15px", borderBottomRightRadius:"15px", borderTopRightRadius:"15px"}}>
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
							<Typography variant="h5" style={{marginTop:"10px", marginLeft:"10px"}}>Reports:</Typography>
						</Row>
						<hr/>
							<Row style={{height:"70%"}}>
								<Col style={{height:"100%", width:"100%", overflowY:"auto"}}>
									{reportBoxes}
								</Col>
							</Row>
							{Number.parseInt(worldUsers[selectedElement].status)===0 ?
								<Row style={{marginTop:"3px", height:"12%", backgroundColor:"#0B132B", borderBottomRightRadius:"10px"}}>
									<Button variant="warning" size="sm" style={{height:"80%", minWidth:"70px", marginRight:"10px", marginTop:"auto",marginBottom:"auto", marginLeft:"15px"}} onClick={()=>changeStatus(2)}>Delete</Button>{' '}
									<Button variant="danger" size="sm" style={{height:"80%", minWidth:"70px", marginRight:"10px", marginTop:"auto",marginBottom:"auto"}}  onClick={()=>changeStatus(1)} >Ban</Button>{' '}
								</Row>
								:
								<Row style={{marginTop:"3px", height:"12%", backgroundColor:"#0B132B", borderBottomRightRadius:"10px"}}>
									<Button variant="success" size="sm" style={{height:"80%", minWidth:"70px", marginRight:"10px", marginTop:"auto",marginBottom:"auto", marginLeft:"15px"}} onClick={()=>changeStatus(0)}>Allow</Button>{' '}
								</Row>
							}
					</Col>
				</Row>
			)}
		</div>
	);
}
