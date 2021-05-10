import React, { Component } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 345,
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: "30px",
        height: "300px"
        
    },
    media: {
        height: 140,
    },
    margin: {
        margin: theme.spacing(2),
      },
}));


export default function MapCard(props){
    const {map, focusMap, ...other } = props;
    const history = useNavigate();
    const routeChange = () =>{
      let path = `/world/`+map.world_id; 
      history(path);
    }

    const goToDetails = () => {
        history(`../`+map.world_id, {state:map.world_id});
    }

    const classes = useStyles();
    return(
        <>
            <Col xs={12} sm={6} md={4}>
                <Card className={classes.root}>
                <CardActionArea>
                <CardMedia
                    className={classes.media}
                    image="https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg"
                    title={map.name}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                    {   map.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        {map.description}
                    </Typography>
                </CardContent>
                </CardActionArea>
                <CardActions>
                <Button  to="/App" size="small" color="primary" onClick={routeChange}>
                    Enter
                </Button>
                <Button onClick={() => goToDetails()} size="small" color="primary">
                    More Details
                </Button>
                </CardActions>
                </Card>
            </Col>
        </>
    );
}
