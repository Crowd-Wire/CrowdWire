import React, { useState, Component } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import MapCard from 'components/MapCard/MapCard.js';
import Row from 'react-bootstrap/Row';
import MapFilters from 'components/MapFilters/MapFilters.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import WorldService from 'services/WorldService';
import Pagination from '@material-ui/lab/Pagination';
const useStyles = theme => ({
	root: {
		maxWidth: 345,
		marginLeft: "auto",
		marginRight: "auto",
		marginBottom: "30px",
	},
	media: {
		height: 140,
	},
	margin: {
		margin: theme.spacing(2),
	},
	filter: {
		margin: "auto",
	},
	filterIcon: {
		fontSize: "2rem",
		borderRadius: "5px",
		'&:hover': {
			backgroundColor: "#45B0AE",
		},
	},
	formControl: {
		marginRight: theme.spacing(1.5),
		minWidth: 90,
	},
});

class SearchAllMaps extends Component {

	state = {
		maps: [],
		prevSearch: "",
		prevTags: [],
		page: 1
	}

	focusMap = () => {
		this.props.handler(false)
	}

	joined = this.props.joined;


	search_handler = (search, tags) => {
		this.state.prevSearch=search;
		this.state.prevTags=tags
		console.log(this.state.page)
		WorldService.search(search, tags, this.props.joined, this.state.page)
			.then((res) => { return res.json() })
      .then((res) => { this.setState({ maps: res }) });
	}
	changePage = async (event, page) => {
		await this.setState({page: page});
		console.log(this.state.page);
		this.search_handler(this.state.prevSearch, this.state.prevTags);
	}

	componentDidMount(){

		WorldService.search("", [], this.props.joined, 1)
			.then((res) => {
				if(res.status == 200) 
					return res.json()
			 })
			.then((res) => {
				if(res)
					this.setState({ maps: res }) 
			});
	}
	async componentDidUpdate(){
		if(this.joined!=this.props.joined){
			this.joined = this.props.joined;
			await this.setState({prevSearch: "", prevTags: []});
			WorldService.search("", [], this.props.joined, this.state.page)
				.then((res) => {
					if(res.status == 200) 
						return res.json()
				})
				.then((res) => {
					if(res)
						this.setState({ maps: res }) 
				});
		}
	}

	render() {
		const { classes } = this.props;
		return (
			<>
				<Container style={{ overflowX: "hidden" }}>
					<MapFilters handler={this.search_handler} />
					<hr />
					<Row>
						{this.state.maps.map((m, i) => {
							return (<MapCard focusMap={this.focusMap} key={i} map={m} />)
						})}
					</Row>
					<hr />
					<Row style={{marginBottom:"30px"}}>
						<Pagination onChange={(event,page) => {this.changePage(event, page)}} style={{marginLeft:"auto", marginRight:"auto"}} count={10} />
					</Row>
				</Container>
			</>
		);

	}
}
export default withStyles(useStyles)(SearchAllMaps);
