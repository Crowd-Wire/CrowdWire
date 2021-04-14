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
import MapFilters from 'components/MapFilters/MapFilters.js'
import 'bootstrap/dist/css/bootstrap.min.css';

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
          margin:"auto",
      },
      filterIcon: {
          fontSize:"2rem",
          borderRadius:"5px",
          '&:hover':{
              backgroundColor:"#45B0AE",
          },
      },
      formControl: {
        marginRight: theme.spacing(1.5),
        minWidth: 90,
      },
});

class SearchAllMaps extends Component{
	constructor(props){
		super(props);
		this.cards=[];
	}
	maps=[
		{"Title":"City","description":"This map was created with the purpose of gathering people to explore a beautiful city and convey a near life-like experience to users."},
		{"Title":"Junle","description":"This map was created with the purpose of gathering people to explore the ruins of the lost temple and convey a near life-like experience to users."},
		{"Title":"Mountains","description":"It is really cold up here."}
	]
	componentDidMount(){

		this.setState();
	}

	focusMap = () => {
		this.props.handler(true)
	}
	render() {
		const { classes } = this.props;
		for(let i = 0;i<this.maps.length;i++){
			console.debug(this.maps[i]["Title"]);
			this.cards.push(<MapCard title={this.maps[i]["Title"]} desc={this.maps[i]["description"]} focusMap={this.focusMap}/>);
		}
		return(
			<>
				<Container style={{overflowX: "hidden"}}>
					<MapFilters/>
					<hr/>
					<Row>
						{this.cards}
					</Row>
				</Container>
			</>
		);

	}
}

export default withStyles(useStyles)(SearchAllMaps);
