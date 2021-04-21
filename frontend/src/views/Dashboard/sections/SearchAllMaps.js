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

	state ={
		maps: [],
		typeAccess: '',
		typeFormat: '',
		typeTopic: '',
	}
		
	
    
    // handleChange = (prop) => (event) => {
			//     setValues({ ...values, [prop]: event.target.value });
			//   };
			
			// deleteFilters() {
				//     setFormat('');
				//     setAccess('');
				// }
				// handleAccessibility = (event) => {
					// 	setAccess(event.target.value);
					// };
					
					// handleTopic = (event) => {
						// 	setTopic(event.target.value);
						// };
						
						// handleFormat = (event) => {
							//     setFormat(event.target.value);
							// };
							// [values, setValues] = React.useState({
								// amount: '',
								// });
		focusMap = () => {
			this.props.handler(false)
		}


			
		
		search_handler = (search) => {
			// maybe n meter as cenas no state pq n deve ser preciso para nada
			console.log(search);
			
			WorldService.search(search, [])
			.then((res) => { return res.json() })
			.then( (res) => { this.setState({maps: res}) })
			;

		}


		render() {
			const { classes } = this.props;
			return(
					<>
						<Container style={{overflowX: "hidden"}}>
							<MapFilters handler={ this.search_handler }/>
							{/* <Row style={{alignContent:"center", marginBottom:"30px"}}>
								<Col xs={12} sm={12} md={6}>
										<FormControl fullWidth className={classes.margin} variant="outlined" >
											<InputLabel htmlFor="outlined-margin-normal">Search Map</InputLabel>
											<OutlinedInput
												id="outlined-adornment-amount"
												value={values.amount}
												onChange={handleChange('amount')}
												startAdornment={<InputAdornment position="start"><SearchIcon/></InputAdornment>}
												labelWidth={90}
											/>
										</FormControl>
								</Col>
								<Col xs={12} sm={12} md={6} className={classes.filter}>
									<Row>
										<Col xs={10} sm={10} md={10}></Col>
											<Col xs={2} sm={2} md={1} style={{float:"right"}}>
												<TuneIcon className={classes.filterIcon} onClick={toggleFilter} style={{float:"right"}}/>
											</Col>
											<Col xs={0} sm={0} md={1}></Col>
									</Row>
								</Col>
							</Row>
							<Row>                                
								{isOpened ?
									<Col xs={12} sm={12} md={12} lg={12} style={{alignContent:"center"}}>
										<Container style={{marginLeft:"auto", marginRight:"auto"}}>
												<FormControl className={classes.formControl} >
													<Select
														value={typeAccess}
														onChange={handleAccessibility}
														displayEmpty
														className={classes.selectEmpty}
														inputProps={{ 'aria-label': 'Without label' }}
													>
													<MenuItem value="">
														<em>Accessibility</em>
													</MenuItem>
													<MenuItem value={'public'}>Public</MenuItem>
													<MenuItem value={'private'}>Private</MenuItem>
													</Select>
												</FormControl>
												<FormControl className={classes.formControl}>
													<Select
														value={typeFormat}
														onChange={handleFormat}
														displayEmpty
														className={classes.selectEmpty}
														inputProps={{ 'aria-label': 'Without label' }}
													>
													<MenuItem value="">
														<em>Typology</em>
													</MenuItem>
													<MenuItem value={'Leisure'}>Leisure</MenuItem>
													<MenuItem value={'Meetings'}>Meetings</MenuItem>
													<MenuItem value={'Classes'}>Classes</MenuItem>
													<MenuItem value={'Conferences'}>Conferences</MenuItem>
													</Select>
												</FormControl>
												<FormControl className={classes.formControl}>
													<Select
														value={typeTopic}
														onChange={handleTopic}
														displayEmpty
														className={classes.selectEmpty}
														inputProps={{ 'aria-label': 'Without label' }}
													>
													<MenuItem value="">
														<em>Topic</em>
													</MenuItem>
													<MenuItem value={'General'}>General</MenuItem>
													<MenuItem value={'Technology'}>Technology</MenuItem>
													<MenuItem value={'Biology'}>Biology</MenuItem>
													<MenuItem value={'Philosophy'}>Philosophy</MenuItem>
													<MenuItem value={'Geology'}>Geology</MenuItem>
													</Select>
												</FormControl>
											<HighlightOffIcon title="Delete Filters" className={classes.filterIcon} onClick={deleteFilters}/>
										</Container>
									</Col>
									:          
									<Col xs={10} sm={10} md={10}></Col>
								}
							</Row> */}
							<hr/>
							<Row>
								{this.state.maps.map((m, i) => {
									return(<MapCard focusMap={this.focusMap} key={i} map={m}/>)
								} )}
							</Row>
						</Container>
					</>
					);

		}
}

export default withStyles(useStyles)(SearchAllMaps);
