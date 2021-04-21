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
    const {title, desc, focusMap, ...other } = props;
    const history = useNavigate();
    console.log(title);
    const routeChange = () =>{ 
      let wId=1
      let path = `../world/`+wId; 
      history(path);
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
                    title={title}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                    {title}
                    </Typography>
                    <Typography noWrap variant="body2" color="textSecondary" component="p">
                        {desc}
                    </Typography>
                </CardContent>
                </CardActionArea>
                <CardActions>
                <Button  to="/App" size="small" color="primary" onClick={routeChange}>
                    Enter
                </Button>
                <Button onClick={() => props.focusMap()} size="small" color="primary">
                    More Details
                </Button>
                </CardActions>
                </Card>
            </Col>
        </>
    );
}
