import React, { Component } from "react";

import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from 'views/WorldSettings/sections/TabPanel.js';


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
					<Tabs value={this.state.value} onChange={this.changeTab} aria-label="simple tabs example">
						<Tab label="Item One" {...this.a11yProps(0)} />
						<Tab label="Item Two" {...this.a11yProps(1)} />
						<Tab label="Item Three" {...this.a11yProps(2)} />
					</Tabs>
					<div>
						<TabPanel value={this.state.value} index={0}>CHEFAO</TabPanel>
						<TabPanel value={this.state.value} index={1}>ADMIN</TabPanel>
						<TabPanel value={this.state.value} index={2}>Boss</TabPanel>	
					</div>
			</div>
		);
	};
}

export default (WSettingsContent);
