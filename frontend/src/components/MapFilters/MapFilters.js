import React, { useState, Component, useEffect } from "react";
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
import { Button } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import TagService from 'services/TagService';

const useStyles = makeStyles((theme) => ({
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
}));

let search = "";
let tag_array = [];
export default function MapFilters(props) {

  const classes = useStyles();


  useEffect (() => {
    TagService.getAll()
			.then((res) => {return res.json()})
			.then((res) => {
        console.log(res);
        let arr = [];
        res.forEach(tag => arr.push(tag.name)); 
        setTags(arr);
      })
  }, [])

  const [tags, setTags] = React.useState([]);
  const [typeAccess, setAccess] = React.useState('');
  const [typeFormat, setFormat] = React.useState('');
  const [typeTopic, setTopic] = React.useState('');
  const [isOpened, setIsOpened] = useState(false);

  function toggleFilter() {
    setIsOpened(wasOpened => !wasOpened);
  }

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
    search = event.target.value;
    console.log(search);
  };

  function deleteFilters() {
    setFormat('');
    setAccess('');
    setTopic('');

  }
  const handleAccessibility = (event) => {
    setAccess(event.target.value);
  };

  const handleTopic = (event) => {
    setTopic(event.target.value);
  };

  const handleFormat = (event) => {
    setFormat(event.target.value);
  };
  const [values, setValues] = React.useState({
    amount: '',
    });
    return(
        <>
					<Row style={{alignContent:"center", marginBottom:"30px"}}>
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
									<Container size="small" style={{marginLeft:"auto", marginRight:"auto"}}>
										<Autocomplete
											limitTags={5}
											style={{width:"70%", marginLeft:"auto",marginRight:"auto"}}
											multiple
                      onChange={(event, value) => tag_array = value}
											id="tags-standard"
											options={tags}
											getOptionLabel={(option) => option}
											renderInput={(params) => (
											<TextField
												{...params}
												variant="standard"
												label="Labels"
											/>
											)}
										/>
									</Container>
							</Col>
							:          
							<Col xs={10} sm={10} md={10}></Col>
						}
					</Row>
          <Row>
            <Button onClick={() => props.handler(search, tag_array)}>Search</Button>
          </Row>
        </>
    );
}
