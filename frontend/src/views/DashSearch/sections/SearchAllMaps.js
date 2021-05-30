import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import MapCard from 'components/MapCard/MapCard.js';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import MapFilters from 'components/MapFilters/MapFilters.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import WorldService from 'services/WorldService';
import Pagination from '@material-ui/lab/Pagination';
import Typography from '@material-ui/core/Typography';
import useAuthStore from "stores/useAuthStore";
import IntroText from 'components/IntroText/IntroText';
import { useParams } from "react-router-dom";

export const withRouter = (Component) => {
  const Wrapper = (props) => {
    const params = useParams();
    
    return (
      <Component
	  	params={params}
        {...props}
        />
    );
  };
  
  return Wrapper;
};

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

	constructor(props){
		super(props)
		this.type = props.params.type;
		this.joined = this.props.joined;
		this.state = {
			maps: [],
			search: "",
			tags: [],
			page: 1
		}
	}

	focusMap(id){
		this.props.handler(id);
	}

	search_handler = () => {
		WorldService.searchUsers(this.state.search, this.state.tags, this.type, null, null, this.state.page, 10)
			.then((res) => { return res.json() })
      		.then((res) => { this.setState({ maps: res }) })
			.catch((err) => { useAuthStore.getState().leave() });
	}

	changePage = async (event, page) => {
		await this.setState({page: page});
		this.search_handler(this.state.prevSearch, this.state.prevTags);
	}

	changeTags = async (value) => {
		await this.setState({tags: value});
	}

	changeSearch = (value) => {
		this.setState({search: value});
	}

	componentDidMount(){
		WorldService.searchUsers("", [], this.type, null, null, 1, 10)
			.then((res) => {
				if(res.status == 200) 
					return res.json()
			 })
			.then((res) => {
				if(res)
					this.setState({ maps: res }) 
			}).catch((error) => {useAuthStore.getState().leave()});
	}
	async componentDidUpdate(){
		// TODO: there might be a bug here because of the page variable when calling the service
		// TODO: add the order_by filters
		if(this.type!=this.props.params.type){
			this.type = this.props.params.type;
			await this.setState({prevSearch: "", prevTags: []});
			WorldService.searchUsers("", [], this.type, null, null, this.state.page, 10)
				.then((res) => {
					if(res.status == 200) 
						return res.json()
				})
				.then((res) => {
					if(res)
						this.setState({ maps: res }) 
					this.setState({search:"", tags: []});
				}).catch((error) => {useAuthStore.getState().leave()});
		}
	}

	render() {
		const { classes } = this.props;
		return (
			<>
				<Container style={{ overflowX: "hidden" }}>
					<Row sm={12} style={{paddingBottom: 60}}>
						<Col sm={12} style={{textAlign: "center"}}>
							<IntroText />
						</Col>
					</Row>
					<MapFilters changeTags={this.changeTags} changeSearch={this.changeSearch} search={this.state.search} tag_array={this.state.tags} handler={this.search_handler} />
					<hr />
					<Row style={{marginTop: 50, marginBottom: 50}}>
						{this.state.maps!==null && this.state.maps.length!==0 ? 
						this.state.maps.map((m, i) => {
							return (<MapCard key={i} focusMap={this.focusMap} map={m} />)
						})
						:
						<Typography style={{marginLeft:"auto", marginRight:"auto"}}>No worlds with these specifications.</Typography>
					}
					</Row>
					<hr />
					{this.state.maps===null || this.state.maps.length===0 ?
						<></>
						:
						<Row style={{marginBottom:"30px"}}>
							<Pagination onChange={(event,page) => {this.changePage(event, page)}} style={{marginLeft:"auto", marginRight:"auto"}} count={10} />
						</Row>
					}
				</Container>
			</>
		);

	}
}
export default withRouter(withStyles(useStyles)(SearchAllMaps));
