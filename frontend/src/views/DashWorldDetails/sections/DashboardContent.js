import React, { Component } from "react";

import { Typography } from "@material-ui/core";
import CancelIcon from '@material-ui/icons/Cancel';
import Badge from 'components/Badge/Badge.js';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DashboardStats from 'views/DashWorldDetails/sections/DashboardStats.js'
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import WorldService from 'services/WorldService.js';
import useAuthStore from 'stores/useAuthStore.ts';
import { Navigate } from 'react-router-dom';

class DashboardContent extends Component{

	constructor(props){
		super(props);
		this.state={
			worldInfo: null,
			navigate: false
		}
	}
    cardTextStyles = {
			marginLeft:"5%",
			color:"white",
			display:"flex",
			verticalAlign: "center",
			maxWidth:"80%"
	};

	navigate(){
«		this.setState({navigate:true});
	}

	componentDidMount(){
		const url = window.location.pathname;
		WorldService.getWorldDetails(url[url.length - 1])
		  .then((res) => {
			if (res.status == 200)
			  return res.json()
		  })
		  .then((res) => {
			if (res)
			  this.setState({worldInfo:res})
		  }).catch((error) => { useAuthStore.getState().leave() });
	}

	spanStyle = {
		height:"30px",
		width:"auto",
		backgroundColor:"grey",
		borderRadius:"10px",
		padding:"5px",
		marginLeft:"5px"
	};

	tags = () => {
		let labels = [];
		if(this.state.worldInfo.tags===undefined)
			return;
		if(this.state.worldInfo.tags.length===0)
			labels.push(<Typography style={{color:"white"}}>No tags available for this world.</Typography>);
		for(let i = 0; i < this.state.worldInfo.tags.length;i++){
			labels.push(<span style={this.spanStyle}>{this.state.worldInfo.tags[i].name}</span>);
		}

		return labels;
	}

	date = () => {
		if(this.state.worldInfo.creation_date===undefined)
			return;
		let x = this.state.worldInfo.creation_date.split("T");
		return x[0];
	}
	render(){
		if(!this.state.worldInfo){
			return(<div></div>);
		}
		else if(this.state.navigate)
			return(<Navigate to="../search/public"></Navigate>);
		return(
			<div style={{ padding: '10px', marginLeft:"5%", width:"100%"}}>    
				<Row style={{ width:"100%", height:"50%", marginTop:"5%", minWidth:"770px"}}>
					<Col xs={10} sm={10} md={10} style={{backgroundSize:"cover", borderRadius:"15px", backgroundRepeat:"no-repeat",backgroundImage: 'url("https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg")'}}>
						<div style={{ position: 'absolute', bottom: 0, left: 0, borderBottomLeftRadius:"15px", borderBottomRightRadius:"15px", height:"50%", width:"100%", backgroundColor: "rgba(11, 19, 43, 0.85)"}}>
							<Typography noWrap variant="h3" style={this.cardTextStyles} >
								{this.state.worldInfo.name}
							</Typography>
							<Typography variant="caption" style={this.cardTextStyles}>
								Creation Date {this.date()}
							</Typography>
							<Row style={{width:"90%", marginRight:"auto", marginLeft:"30px", marginTop:"20px"}}>
								<Col xs={1} sm={1} md={1}>
									<Typography variant="body1" className="align-middle" style={{color:"white", marginLeft:"5%", width:"80%", marginTop:"3%", fontWeight:"bold"}}>
										<BookmarksIcon style={{backgroundColor:"white", borderRadius:"50%", padding:"2px", height:"30px",width:"30px", color:"black"}}/>
									</Typography>
								</Col>
								<Col xs={7} sm={7} md={7}>
									<Row>
										{this.tags()}
									</Row>
								</Col>
								<Col>
									<Typography style={{marginLeft:"auto", color:"white", marginTop:"10px"}}>Max Online Users: {this.state.worldInfo.max_users}</Typography>
								</Col>
							</Row>
						</div>
					</Col>
					<Col xs={1} sm={1} md={1}></Col>
					<Col xs={1} sm={1} md={1}><CancelIcon onClick={() => this.navigate()} style={{fontSize:"2rem"}}/></Col>
				</Row>
				<Row style={{minHeight:"39%", marginTop:"1%", width:"100%"}}>
					<DashboardStats details={this.state.worldInfo} />
				</Row>
			</div>
		);
	}
}
export default DashboardContent;
