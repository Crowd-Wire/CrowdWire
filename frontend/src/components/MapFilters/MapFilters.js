import React, { useState, useEffect } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TuneIcon from '@material-ui/icons/Tune';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Button } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import TagService from 'services/TagService';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import DirectionsIcon from '@material-ui/icons/Directions';

const useStyles2 = makeStyles((theme) =>
  createStyles({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
  }),
);

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
    color: 'white',
    margin: "auto",
  },
  filterIcon: {
    fontSize: "2rem",
    color: 'white',
    borderRadius: "5px",
    '&:hover': {
      backgroundColor: "#45B0AE",
    },
  },
  formControl: {
    marginRight: theme.spacing(1.5),
    minWidth: 90,
  }
}));


export default function MapFilters(props) {

  const classes = useStyles();
  const classes2 = useStyles2();

  useEffect (() => {
    TagService.getAll()
			.then((res) => {
        if(res.status == 200)
          return res.json()
      })
			.then((res) => {
        let arr = [];
        if(res)
          res.forEach(tag => arr.push(tag.name)); 
        setTags(arr);  
      })
  }, [])

  const [tags, setTags] = React.useState([]);
  const [isOpened, setIsOpened] = useState(false);

  function toggleFilter() {
    setIsOpened(wasOpened => !wasOpened);
  }

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
    props.changeSearch(event.target.value);
  };
  
  const handleKeyPress = (event) => {
    var enterKey = 13; //Key Code for Enter Key
    if (event.which == enterKey){
      props.handler()
    }
  } 

  const [values, setValues] = React.useState({
    amount: '',
    });
    return(
        <>
          
					<Row style={{alignContent:"center", marginBottom:"30px"}}>
						<Col xs={12} sm={12} md={12}>
              <Paper className={classes2.root}>
                <IconButton className={classes2.iconButton} aria-label="menu" onClick={toggleFilter}>
                  <MenuIcon />
                </IconButton>
                <InputBase
                  className={classes2.input}
                  placeholder="Search Worlds"
                  inputProps={{ 'aria-label': 'search worlds' }}
                  value={props.search}
                  onChange={handleChange('amount')}
                  onKeyPress={(event) => handleKeyPress(event)}
                />
                <Divider className={classes2.divider} orientation="vertical" />
                <IconButton className={classes2.iconButton} aria-label="search" onClick={props.handler}>
                  <SearchIcon />
                </IconButton>
              </Paper>
						</Col>
					</Row>
					<Row>                                
						{isOpened ?
							<Col xs={12} sm={12} md={12} lg={12} style={{alignContent:"center", paddingBottom: 40, paddingTop: 20}}>
									<Container size="small" style={{marginLeft:"auto", marginRight:"auto"}}>
										<Autocomplete
											limitTags={5}
											style={{width:"100%", marginLeft:"auto",marginRight:"auto"}}
                      multiple
                      value={props.tag_array}
                      onChange={(event, value) => props.changeTags(value)}
											id="tags-standard"
											options={tags}
											getOptionLabel={(option) => option}
											renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label="Tags"
                          InputLabelProps={{ style: { color: 'white'}}}
                        />
											)}
										/>
									</Container>
							</Col>
							:          
							<Col xs={10} sm={10} md={10}></Col>
						}
					</Row>
        </>
    );
}
