import React, { Component } from "react";

import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RolePanel from 'views/WorldSettings/sections/RolePanel.js';
import KickBanPanel from 'views/WorldSettings/sections/KickBanPanel.js';
import WorldSettingsPanel from 'views/WorldSettings/sections/WorldSettingsPanel.js';


class WSettingsContent extends Component {
	state = {value: 0};
	constructor(props){
		super(props);
	}

	changeTab = (event, newValue) => {
		this.setState({value:newValue});
	};
	
	a11yProps(index) {
		console.log("index"+index);
		return {
			id: `simple-tab-${index}`,
			'aria-controls': `simple-tabpanel-${index}`,
		};
	}


	render() {
		const { classes } = this.props;
		return(
			<div style={{width:"75%", marginLeft:"5%", marginTop:"5%"}}>
					<Row style={{height:"10%"}}>
						<Typography variant="h5" style={{color:"white"}}>Map: Jungle</Typography>
					</Row>
					<Row style={{borderTopRightRadius:"10px",borderTopLeftRadius:"10px"}}>
						<Tabs value={this.state.value} onChange={this.changeTab} style={{fontColor:"white", borderTopRightRadius:"10px",borderTopLeftRadius:"10px", border:"solid 1px black", backgroundColor:"black"}} aria-label="simple tabs example">
							<Tab label="Role" style={{color:"white"}} {...this.a11yProps(0)} />
							<Tab label="Kicks/Bans" style={{color:"white"}} {...this.a11yProps(1)} />
							<Tab label="World Settings" style={{color:"white"}} {...this.a11yProps(2)} />
						</Tabs>
					</Row>
					<div style={{minHeight:"400px", backgroundColor:"red"}}>
						<RolePanel style={{height:"100%"}} value={this.state.value} index={0}>CHEFAO</RolePanel>
						<KickBanPanel value={this.state.value} index={1}>ADMIN</KickBanPanel>
						<WorldSettingsPanel value={this.state.value} index={2}>Boss</WorldSettingsPanel>	
					</div>
			</div>
		);
	};
}

export default (WSettingsContent);