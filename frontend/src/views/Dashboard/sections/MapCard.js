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

import InputAdornment from '@material-ui/core/InputAdornment';

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
}));

export default function MapCard(){
    const classes = useStyles();
    return(
        <>
            <Col xs={12} sm={6} md={4}>
                <Card className={classes.root}>
                <CardActionArea>
                <CardMedia
                    className={classes.media}
                    image="https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg"
                    title="Jungle"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                    Jungle
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                    This map was created with the purpose of gathering people to explore the ruins of the lost temple and convey a near life-like experience to users.
                    </Typography>
                </CardContent>
                </CardActionArea>
                <CardActions>
                <Button size="small" color="primary">
                    Enter
                </Button>
                <Button size="small" color="primary">
                    More Details
                </Button>
                </CardActions>
                </Card>
            </Col>
        </>
    );
}
