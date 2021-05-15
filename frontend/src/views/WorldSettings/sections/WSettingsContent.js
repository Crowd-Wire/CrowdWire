import React, { Component } from "react";

import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RolePanel from 'views/WorldSettings/sections/RolePanel.js';
import KickBanPanel from 'views/WorldSettings/sections/KickBanPanel.js';
import WorldService from 'services/WorldService.js';
import RoleService from 'services/RoleService.js';
class WSettingsContent extends Component {


		
	constructor(props){
		super(props);
		this.state = 
		{
			value: 0,
			roles: {
				'Admin':{'permissions':[0,1,2,3,4,5,6,7],'users':[{'id':1,'Nome':'João'}, {'id':2,'Nome':'Maria'},{'id':3, 'Nome':'António'}]},
				'Ac':{'permissions':[0,1,2,4,5,7],'users':[{'id':4,'Nome':'Carlos'}, {'id':5,'Nome':'Sofia'}, {'id':6,'Nome':'meunicklegal'}]},
				'Member':{'persmissions':[0,1,2,7],'users':[{'id':7,'Nome':'meunickilegal'},{'id':8,'Nome':'xXnoobM4sterXx'}]},
				'Atrasados':{'permissions':[], 'users':[{'id':9,'Nome':'Wilson'}]}
			},
			users: ['Silvia','Marco','Teixeira'],
			reports: [
				{'Reported':'Silva','Reporter':'Silvia','Message':'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac mauris sit amet odio elementum euismod nec ac enim.'},
				{'Reported':'Marco','Reporter':'Silvia','Message':'Lorem ipsum dolor sit amet'},
				{'Reported':'Silvia','Reporter':'Marco','Message':'Maecenas ac mauris sit amet odio elementum euismod nec ac enim.'}
			],
			path: window.location.pathname,
			details: null,
			mapName:""
		};
	}
	
	getRoles = () => {
		RoleService.getAllRoles(1)
		.then((res) => {
			return res.json();
		})
		.then((res) => {
			let newRoles = this.state.roles;
			console.log(res);
			res.forEach((role)=>{
				newRoles[role.id]={"ban":res.ban,"chat":res.chat,"conference_manage":res.conference_manage,"invite":res.invite,"is_default":res.is_default,"name":res.name,"role_manage":res.role_manage,"talk":res.talk,"talk_conference":res.talk_conference,"walk":res.walk,"world_mute":res.world_mute};
				this.setState({roles:newRoles});
			})
			console.log(this.state.roles);
			console.log(res);
		})
	}
	setUsers = (item, rName) => {
		this.setState(state => {

			const roles = state.roles;
			let flag = false;
			for (let [key, value] of Object.entries(roles)) {
				let users = value.users;	
				for (let i=0; i < users.length; i++) {
					if (users[i]['id'] == item.id) {
						users.splice(i, 1);
						flag = true;
						break;
						
					}
				}
				if (flag) break;
			}
			roles[rName].users.splice(0, 0, item);

			return { roles };
		})
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

	componentDidMount(){
		const page_url = this.state.path.split("/");
		const page = page_url[2];
		const world_id=page;
		this.setState({path:world_id});
		WorldService.getWorldDetails(world_id).then((res) => {
			return res.json();
		})
		.then((res)=>{
			this.setState({worldName: res.name});
		})
	}


	render() {
		const { classes } = this.props;
		return(
			<div style={{width:"75%", minWidth:"650px", marginLeft:"5%", marginTop:"5%"}}>
					<Row style={{height:"10%"}}>
						<Typography variant="h5" style={{color:"white"}}>Map: {this.state.worldName} </Typography>
					</Row>
					<Row style={{borderTopRightRadius:"10px",borderTopLeftRadius:"10px"}}>
						<Tabs value={this.state.value} onChange={this.changeTab} style={{fontColor:"white", borderTopRightRadius:"10px",borderTopLeftRadius:"10px", border:"solid 1px black", backgroundColor:"black"}} aria-label="simple tabs example">
							<Tab label="Role" style={{color:"white"}} {...this.a11yProps(0)} />
							<Tab label="Kicks/Bans" style={{color:"white"}} {...this.a11yProps(1)} />
						</Tabs>
					</Row>
					<div style={{height:"400px", backgroundColor:"red"}}>
						<RolePanel roles={this.getRoles} users={this.users} style={{height:"100%"}} value={this.state.value} index={0} setUsers={this.setUsers}>CHEFAO</RolePanel>
						{/* <KickBanPanel users={this.state.users} reports={this.state.reports} value={this.state.value} index={1}>ADMIN</KickBanPanel> */}
					</div>
			</div>
		);
	};
}

export default (WSettingsContent);
