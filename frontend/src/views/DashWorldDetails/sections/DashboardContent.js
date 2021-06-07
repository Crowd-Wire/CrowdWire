import React, { Component } from "react";

import { Typography } from "@material-ui/core";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DashboardStats from 'views/DashWorldDetails/sections/DashboardStats.js'
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import WorldService from 'services/WorldService.ts';
import { Navigate } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit';
import Button from "components/CustomButtons/Button.js";
import ClearIcon from '@material-ui/icons/Clear';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import TagService from 'services/TagService';
import Container from '@material-ui/core/Container';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import { createBrowserHistory } from 'history';
import { toast } from 'react-toastify';
import logo from 'assets/crowdwire_white_logo.png';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

const toast_props = {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true,
    pauseOnFocusLoss: false,
    pauseOnHover: false,
    progress: undefined,
  }

class DashboardContent extends Component{

	constructor(props){
		super(props);
		this.state={
			worldInfo: null,
			navigate: false,
			editing: false,
			tags: [],
			chosenTags: [],
			goToWorld: null,
			isCreator: false,
			canManage: false
		}
		this.history = createBrowserHistory();
		this.updateWorldInfo = this.updateWorldInfo.bind(this);
		this.uploadFile = this.uploadFile.bind(this);
	}
    cardTextStyles = {
		marginLeft:"5%",
		color:"white",
		display:"flex",
		verticalAlign: "center",
		maxWidth:"80%"
	};

	inputTextStyles = {
		marginLeft:"5%",
		color:"white",
		display:"flex",
		verticalAlign: "center",
		maxWidth:"80%",
		color:"white",
		backgroundColor: 'transparent',
		border: 0,
	};
	
	toggleEditing() {
		this.setState({editing: !this.state.editing});
		if (!this.state.editing) {
			let chosTags = [];
			for (let i = 0; i < this.state.worldInfo.tags.length;i++){
				chosTags.push(this.state.worldInfo.tags[i].name)
			}
			this.setState({chosenTags: chosTags})
		}
	}

	navigate(){
		this.setState({navigate:true});
	}

	enterMap = () => {
		const url = window.location.pathname;
		let path = `/world/`+url[url.length - 1];
		this.setState({goToWorld: path})
	}

	componentDidMount(){
		const url = window.location.pathname;
		WorldService.getWorldDetails(url[url.length - 1])
		  .then((res) => {
			if (res.status == 200)
			  return res.json()
		  })
		  .then((res) => {
			if (res) {
				if (res.detail){
					toast.dark(
						<span>
						<img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
						{res.detail}
						</span>
					,toast_props);
					this.navigate();
				} else {
					this.setState({worldInfo:res, isCreator: res.is_creator, canManage: res.can_manage})
					if (res.tags !==undefined) {
						let chosTags = []
						for (let i = 0; i < res.tags.length;i++){
							chosTags.push(res.tags[i].name)
						}
						this.setState({chosenTags: chosTags})
					}
				}
			}
		  }).catch((error) => { this.navigate() });
		
		TagService.getAll()
			.then((res) => {
				if(res.status == 200)
					return res.json()
				})
			.then((res) => {
				let arr = [];
				if(res){
					res.forEach(tag => arr.push(tag.name)); 
				}
				this.setState({tags: arr})
			})
	
	}
		

	spanStyle = {
		height:"30px",
		width:"auto",
		backgroundColor:"white",
		borderRadius:"10px",
		padding:"5px",
		marginLeft:"5px",
		borderRadius: "25px",
		paddingLeft: 10,
		paddingRight: 10
	};

	colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

	tags = () => {
		let labels = [];
		if(this.state.worldInfo.tags===undefined)
			return;

		if(this.state.worldInfo.tags.length===0)
			labels.push(<Typography style={{color:"white"}}>No tags available for this world.</Typography>);

		for(let i = 0; i < this.state.worldInfo.tags.length;i++) {
			labels.push(<span style={{height:"30px",
			width:"auto",
			backgroundColor:"white",
			borderRadius:"10px",
			padding:"5px",
			marginLeft:"5px",
			borderRadius: "25px",
			paddingLeft: 10,
			paddingRight: 10,background: this.colorArray[i]}}>{this.state.worldInfo.tags[i].name}</span>);
		}

		return labels;
	}


	updateWorldInfo({world_picture = undefined}) {
		const url = window.location.pathname;
		if (world_picture === undefined && document.getElementById("world_pic").files.item(0)) {
			let file = document.getElementById("world_pic").files.item(0)
			this.uploadFile(file)
			return
		}
		let wName = document.getElementById("world_name").value;
		let accessibility = document.getElementById("world_public").value;;
		let guests =  document.getElementById("world_allow_guests").value;
		let maxUsers =  document.getElementById("world_max_online").value;
		let tag_array =  this.state.chosenTags;
		let desc = document.getElementById("world_desc").innerText;

		WorldService.putWorld(url[url.length - 1],
			{
				wName,
				accessibility,
				guests,
				maxUsers,
				tag_array,
				desc,
				world_picture
			}	
		).then((res) => {
			return res.json()
		})
		.then((res) => {
			if (res) {
				if (res.detail) {
					toast.dark(
						<span>
						<img src={logo} style={{height: 22, width: 22,display: "block", float: "left", paddingRight: 3}} />
							{res.detail[0].msg}
						</span>
					,toast_props);
				} else {
					this.setState({worldInfo:res})
					if (res.tags !==undefined) {
						let chosTags = []
						for (let i = 0; i < res.tags.length;i++){
							chosTags.push(res.tags[i].name)
						}
						this.setState({chosenTags: chosTags})
					}
					this.toggleEditing()
				}
			}
		})
	}
	
	uploadFile(file) {
		var reader = new FileReader();
		const scope = this;
		reader.onload = function() {
			scope.updateWorldInfo({world_picture: reader.result});
		}
		reader.readAsDataURL(file);
	}

	date = () => {
		if(this.state.worldInfo.creation_date===undefined)
			return;
		let x = this.state.worldInfo.creation_date.split("T");
		return x[0];
	}

	goBack = () => {
		this.history.back();
	} 

	  render(){
		if(!this.state.worldInfo){
			return(<div></div>);
		}
		else if(this.state.navigate)
			return(<Navigate to="../search/public"></Navigate>);
		else if (this.state.goToWorld)
			return(<Navigate to={this.state.goToWorld}></Navigate>);
		return(
			<div style={{ padding: '10px', marginLeft:"5%", marginRight:"2%", width:"100%"}}>    
				<Row style={{height:"80px", marginLeft:"auto", marginRight:"auto"}}>
					<Col>
						<Row style={{ height:"100%", marginLeft:"auto", marginRight:"auto"}}>
							<IconButton style={{border:"white solid 1px",borderRadius:"10px",height:"50px", width:"50px"}} onClick={() => {this.goBack()}}>
								<ArrowBackIcon style={{height:"40px", width:"40px", marginTop:"auto", color:"white", marginBottom:"auto"}}/>
							</IconButton>
						</Row>
					</Col>
				</Row>
				<Row style={{ width:"100%", minHeight: 480, marginTop:"5%", minWidth:"450px" }}>
					<Col xs={12} sm={12} md={12} lg={9} style={{
						bottom: 0,
						overflow: "hidden",
						display: 'flex',
						flexDirection: 'column',
						paddingRight:0,
						paddingLeft: 0,
						backgroundSize:"cover",
						marginBottom: 40,
						borderRadius:"15px",
						minHeight: 500,
						backgroundRepeat:"no-repeat",
						backgroundImage: this.state.worldInfo.profile_image === null ? 
							'url("https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg")'
						: 'url("'+this.state.worldInfo.profile_image+'")',
						}}>
						<Row style={{paddingTop: 8, width: '100%'}}>
							<Col xs={6}>
								{ this.state.editing ?
									<div style={{top: 0, marginLeft: 30, width: '40%', textAlign: "left", paddingTop: 10}}>
										<Button color="primary" round >
											<input type="file"  id="world_pic" accept="image/*" name="img" />
										</Button>
									</div>
								:
									''
								}
							</Col>
							{ this.state.isCreator ? 
								<Col xs={6} style={{textAlign: "right"}}>
									<Button color="primary" round onClick={() => {this.toggleEditing()}}>
										{ !this.state.editing ?
											<span style={{fontWeight: 500, fontSize: '0.9rem'}}><EditIcon />Edit</span>
										:
											<span style={{fontWeight: 500, fontSize: '0.9rem'}}><ClearIcon />Cancel</span>
										}
									</Button>
								</Col>
							: ''
							}
						</Row>
						<div style={{ paddingTop: 15, marginTop: 'auto', borderBottomLeftRadius:"15px", borderBottomRightRadius:"15px", minHeight:"50%", width:"100%", backgroundColor: "rgba(11, 19, 43, 0.85)"}}>
							{ this.state.editing ?
								<>
									<Row style={{width:"90%", marginRight:"auto", marginLeft:"30px", marginTop:"20px"}}>
										<Col xs={8} sm={8} md={8}>
											<input
												id="world_name"
												className="MuiTypography-root MuiTypography-h3 MuiTypography-noWrap"
												style={this.inputTextStyles}
												defaultValue={this.state.worldInfo.name}
											/>
											<Typography variant="caption" style={this.cardTextStyles}>
												Creation Date {this.date()}
											</Typography>
										</Col>
										<Col xs={4} sm={4} md={4} style={{textAlign: "right"}}>
											<p style={{color:"white"}} className="MuiTypography-root MuiTypography-body1"> 
												World:{' '}
												<Select
													native
													className="MuiTypography-root MuiTypography-body1"
													style={{fontWeight: 700, width: 80,color: "white", background: 'transparent', border: 0, marginLeft:"auto", marginTop:"10px"}}
													inputProps={{
														id: 'world_public',
													}}
													defaultValue={this.state.worldInfo.public}
													>
													<option value={true}>Public</option>
													<option value={false}>Private</option>
												</Select>
											</p>
											<p style={{color:"white"}} className="MuiTypography-root MuiTypography-body1"> 
												Guests:{' '}
												<Select
													native
													className="MuiTypography-root MuiTypography-body1"
													style={{fontWeight: 700, width: 80,color: "white", background: 'transparent', border: 0, marginLeft:"auto", marginTop:"10px"}}
													inputProps={{
														id: 'world_allow_guests',
													}}
													defaultValue={this.state.worldInfo.allow_guests}
													>
													<option value={true}>Allow</option>
													<option value={false}>Deny</option>
												</Select>
											</p>
											<p style={{color:"white"}} className="MuiTypography-root MuiTypography-body1"> 
												Max Online Users:
												<input
													id="world_max_online"
													type="number"
													className="MuiTypography-root MuiTypography-body1"
													style={{fontWeight: 700, width: 60,color: "white", background: 'transparent', border: 0, marginLeft:"auto", color:"white", marginTop:"10px"}}
													defaultValue={this.state.worldInfo.max_users}
												/>
											</p>
										</Col>
									</Row>
									<Row style={{width:"90%", marginRight:"auto", marginLeft:"30px", marginTop:"20px"}}>
										<Col xs={2} sm={2} md={2}>
											<Typography variant="body1" className="align-middle" style={{color:"white", marginLeft:"5%", width:"80%", marginTop:"3%", fontWeight:"bold"}}>
												<BookmarksIcon style={{backgroundColor:"white", borderRadius:"50%", padding:"2px", height:"30px",width:"30px", color:"black"}}/>
											</Typography>
										</Col>
										<Col xs={10} sm={10} md={10}>
											<Row>
												<Container size="small" style={{marginLeft:"auto", marginRight:"auto"}}>
													<Autocomplete
														limitTags={5}
														style={{width:"100%", marginLeft:"auto",marginRight:"auto"}}
														multiple
														value={this.state.chosenTags}
														id="tags-standard"
														options={this.state.tags}
														getOptionLabel={(option) => option}
														onChange={(event, value) => this.setState({chosenTags: value})}
														renderInput={(params) => (
															<TextField
															{...params}
															variant="standard"
															label="Tags"
															InputLabelProps={{ style: { color: 'white'}}}
															/>
														)}
													/>
												</Container>
											</Row>
										</Col>
										
									</Row>
									
									<Row style={{width:"90%", marginRight:"auto", marginLeft:"30px", marginTop:"20px", paddingBottom: 10}}>
										<Col sm={8}>
											<span
												id="world_desc"
												contentEditable
												className="MuiTypography-root MuiTypography-body1"
												style={{ height: '100%', width: '100%', color: "white", background: 'transparent', border: 0}}
											>
												{this.state.worldInfo.description}
											</span>
										</Col>
										<Col sm={4} style={{textAlign: "right"}}>
											<Button color="success" size="md" round onClick={this.updateWorldInfo}>
												<span style={{fontWeight: 600, fontSize: '1rem'}}><CheckCircleIcon />Save</span>
											</Button>
										</Col>
									</Row>
								</>
							:
								<>
									<Row style={{width:"90%", marginRight:"auto", marginLeft:"30px", marginTop:"20px"}}>
										<Col xs={8} sm={8} md={8}>
											<Typography noWrap variant="h3" style={this.cardTextStyles} >
												{this.state.worldInfo.name}
											</Typography>
											<Typography variant="caption" style={this.cardTextStyles}>
												Creation Date {this.date()}
											</Typography>
										</Col>
										<Col xs={4} sm={4} md={4} style={{textAlign: "right"}}>
											<Typography style={{marginLeft:"auto", color:"white", marginTop:"10px", fontWeight: 700}}>
												<span style={{fontWeight: 400}}>
													World:
												</span>
												{this.state.worldInfo.public ? ' Public ' : ' Private '}
											</Typography>
											<Typography style={{marginLeft:"auto", color:"white", marginTop:"10px", fontWeight: 700}}>
												<span style={{fontWeight: 400}}>
													Guests 
												</span>
												{this.state.worldInfo.allow_guests ? ' Allowed' : ' Not Allowed'}
											</Typography>
											<Typography style={{marginLeft:"auto", color:"white", marginTop:"10px", fontWeight: 700}}>
												<span style={{fontWeight: 400}}>
													Max Online Users:{' '}
												</span>
												{this.state.worldInfo.max_users}
											</Typography>
										</Col>
									</Row>
									<Row style={{width:"90%", marginRight:"auto", marginLeft:"30px", marginTop:"20px"}}>
										<Col xs={2} sm={2} md={2}>
											<Typography variant="body1" className="align-middle" style={{color:"white", marginLeft:"5%", width:"80%", marginTop:"3%", fontWeight:"bold"}}>
												<BookmarksIcon style={{backgroundColor:"white", borderRadius:"50%", padding:"2px", height:"30px",width:"30px", color:"black"}}/>
											</Typography>
										</Col>
										<Col xs={10} sm={10} md={10}>
											<Row>
												{this.tags()}
											</Row>
										</Col>
									</Row>
									<Row style={{width:"90%", marginRight:"auto", marginLeft:"30px", marginTop:"20px", paddingBottom: 10}}>
										<Col sm={8}>
											<Typography style={{ overflowWrap: 'break-word'}} gutterBottom variant="body1">
												{this.state.worldInfo.description ? this.state.worldInfo.description : "No description available for this world"}
											</Typography>
										</Col>
										<Col sm={4} style={{textAlign: "right"}}>
											<p style={{color: '#4caf50', fontWeight: 600}}>
												<span>{this.state.worldInfo.online_users ? this.state.worldInfo.online_users : 0}</span>
												<FiberManualRecordIcon style={{color: '#4caf50'}}/> Online Users {' '}
											</p>
											<Button color="success" size="md" round onClick={() => this.enterMap()}>
												<span style={{fontWeight: 600, fontSize: '1rem'}}>Enter</span>
											</Button>
										</Col>
									</Row>
								</>
							}
						</div>
					</Col>
					<Col xs={12} sm={12} md={12} lg={2} style={{margin: 'auto'}}>
						<DashboardStats details={this.state.worldInfo} isCreator={this.state.isCreator} canManage={this.state.canManage}/>
					</Col>
				</Row>
			</div>
		);
	}
}
export default DashboardContent;
