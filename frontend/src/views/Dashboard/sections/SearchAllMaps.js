import React, { useState, Component } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import MapCard from 'components/MapCard/MapCard.js';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TuneIcon from '@material-ui/icons/Tune';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import MapFilters from 'components/MapFilters/MapFilters.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import WorldService from 'services/WorldService';
import TagService from 'services/TagService';

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
		typeAccess: '',
		typeFormat: '',
		typeTopic: '',
	}

	focusMap = () => {
		this.props.handler(false)
	}

	search_handler = (search, tags) => {

		WorldService.search(search, tags)
			.then((res) => { return res.json() })
			.then((res) => { this.setState({ maps: res }) });

	}

	componentDidMount(){
		WorldService.search("", [])
			.then((res) => { return res.json() })
			.then((res) => { this.setState({ maps: res }) });

			
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
				</Container>
			</>
		);

	}
}
export default withStyles(useStyles)(SearchAllMaps);
