import React, { Component, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import MapCard from 'views/Dashboard/sections/MapCard.js';
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

import 'bootstrap/dist/css/bootstrap.min.css';

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
}));

export default function SearchAllMaps(){
    const classes = useStyles();

    const [typeAccess, setAccess] = React.useState('');
    const [typeTags, setTags] = React.useState('');
    const [isOpened, setIsOpened] = useState(false);

    function toggleFilter() {
        setIsOpened(wasOpened => !wasOpened);
    }
    
    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
      };

    function deleteFilters() {
        setTags('');
        setAccess('');
    }
    const handleAccessibility = (event) => {
    setAccess(event.target.value);
    };

    const handleTags = (event) => {
        setTags(event.target.value);
    };
    const [values, setValues] = React.useState({
    amount: '',
    });

    return(
        <>
            <Container style={{overflowX: "hidden"}}>
                <Row style={{alignContent:"center"}}>
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
                                {isOpened ?
                                <Col xs={10} sm={10} md={10}>
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
                                        value={typeTags}
                                        onChange={handleTags}
                                        displayEmpty
                                        className={classes.selectEmpty}
                                        inputProps={{ 'aria-label': 'Without label' }}
                                        >
                                        <MenuItem value="">
                                            <em>Tags</em>
                                        </MenuItem>
                                        <MenuItem value={'Leisure'}>Leisure</MenuItem>
                                        <MenuItem value={'Meetings'}>Meetings</MenuItem>
                                        <MenuItem value={'Classes'}>Classes</MenuItem>
                                        <MenuItem value={'Conferences'}>Conferences</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <HighlightOffIcon title="Delete Filters" className={classes.filterIcon} onClick={deleteFilters}/>
                                </Col>
                                :          
                                <Col xs={10} sm={10} md={10}></Col>
                                }
                            <Col xs={2} sm={2} md={1} style={{float:"right"}}>
                                <TuneIcon className={classes.filterIcon} onClick={toggleFilter} style={{float:"right"}}/>
                            </Col>
                            <Col xs={0} sm={0} md={1}></Col>
                        </Row>
                    </Col>
                </Row>
                <hr/>
                <Row>
                    <MapCard/>
                    <MapCard/>
                    <MapCard/>
                    <MapCard/>
                </Row>
            </Container>
        </>
        );
}

