import React, { Component } from "react";

import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RolePanel from 'views/WorldSettings/sections/RolePanel.js';
import KickBanPanel from 'views/WorldSettings/sections/KickBanPanel.js';


class WSettingsContent extends Component {
	roles = {
		'Admin':{'permissions':[0,1,2,3,4,5,6,7],'users':['João', 'Maria', 'António']},
		'Speaker':{'permissions':[0,1,2,4,5,7],'users':['Carlos', 'Sofia', 'meunicklegal']},
		'Member':{'persmissions':[0,1,2,7],'users':['meunickilegal','xXnoobM4sterXx']},
		'Atrasados':{'permissions':[], 'users':['Wilson']}
	};


	users = ['Silvia','Marco','Teixeira'];
	reports = [
		{'Reported':'Silva','Reporter':'Silvia','Message':'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac mauris sit amet odio elementum euismod nec ac enim.'},
		{'Reported':'Marco','Reporter':'Silvia','Message':'Lorem ipsum dolor sit amet'},
		{'Reported':'Silvia','Reporter':'Marco','Message':'Maecenas ac mauris sit amet odio elementum euismod nec ac enim.'}
	];
	state = {value: 0};
	constructor(props){
		super(props);
	}

	changeTab = (event, newValue) => {
		this.setState({value:newValue});
	};
	
	a11yProps(index) {
		return {
			id: `simple-tab-${index}`,
			'aria-controls': `simple-tabpanel-${index}`,
		};
	}


	render() {
		const { classes } = this.props;
		return(
			<div style={{width:"75%", minWidth:"650px", marginLeft:"5%", marginTop:"5%"}}>
					<Row style={{height:"10%"}}>
						<Typography variant="h5" style={{color:"white"}}>Map: Jungle</Typography>
					</Row>
					<Row style={{borderTopRightRadius:"10px",borderTopLeftRadius:"10px"}}>
						<Tabs value={this.state.value} onChange={this.changeTab} style={{fontColor:"white", borderTopRightRadius:"10px",borderTopLeftRadius:"10px", border:"solid 1px black", backgroundColor:"black"}} aria-label="simple tabs example">
							<Tab label="Role" style={{color:"white"}} {...this.a11yProps(0)} />
							<Tab label="Kicks/Bans" style={{color:"white"}} {...this.a11yProps(1)} />
						</Tabs>
					</Row>
					<div style={{height:"400px", backgroundColor:"red"}}>
						<RolePanel roles={this.roles} users={this.users} style={{height:"100%"}} value={this.state.value} index={0}>CHEFAO</RolePanel>
						<KickBanPanel users={this.users} reports={this.reports} value={this.state.value} index={1}>ADMIN</KickBanPanel>
					</div>
			</div>
		);
	};
}

export default (WSettingsContent);
