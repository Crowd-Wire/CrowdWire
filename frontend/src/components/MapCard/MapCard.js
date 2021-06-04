import React, { Component } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from "components/CustomButtons/Button.js";
import Typography from '@material-ui/core/Typography';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';


const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 345,
        minWidth: 250,
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: "30px",
        height: "340px"
        
    },
    media: {
        height: 140,
    },
    margin: {
        margin: theme.spacing(2),
      },
}));


export default function MapCard(props){
    const {baseUrl, map, focusMap, ...other } = props;
    const history = useNavigate();
    const [status, setStatus] = React.useState(null);
    const routeChange = () =>{
      let path = `/world/`+map.world_id; 
      history(path);
    }

    const goToDetails = () => {
        history(""+baseUrl+map.world_id, {state:map.world_id});
    }

    React.useEffect(()=>{
        if(map.status === 1){
            setStatus(
            <span style={{fontWeight: 600, color: '#f51137', float: 'right', top: 0}}>
                {map.online_users ? map.online_users: "Banned"}
                <FiberManualRecordIcon />
            </span>
            );
            return;
        }
        else if(map.status === 0)
        setStatus(
            <span style={{fontWeight: 600, color: '#4caf50', float: 'right', top: 0}}>
                {map.online_users ? map.online_users: 0}
                <FiberManualRecordIcon />
            </span>
        );
    },[props.map])
    const classes = useStyles();
    return(
        <>
            <Col xs={12} sm={12} md={6} lg={4} style={{height: 380, marginLeft: 'auto', marginRight: 'auto'}}>
                <Card className={classes.root}>
                    <CardActionArea onClick={routeChange}>
                        <CardMedia
                            className={classes.media}
                            image={
                                    map.profile_image === null ? 
							        "https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg"
						        :
                                    map.profile_image
                                }
                            title={map.name}
                        />
                        <CardContent style={{height: 80}}>
                            {status}
                            <Typography gutterBottom variant="h5" component="h2">
                            {   map.name}
                            </Typography>
                            <Typography variant="body2" noWrap color="textSecondary" component="p">
                                {map.description}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                    <CardActions style={{textAlign: "center"}}>
                        <Grid container>
                            <Grid item xs={12}>
                                <Button onClick={() => goToDetails()} size="sm" color="transparent">
                                    <span style={{color: 'rgba(0,135,255,1)', fontSize: '.9rem' }}>More Details</span>
                                </Button>
                            </Grid>
                            <Grid item xs={12} pt={2}>
                                <Button style={{width: '60%'}} to="/App" size="md" round color="info" onClick={routeChange}>
                                    <span style={{fontSize: '1rem' }}>Enter</span><ArrowForwardIcon style={{size: '1rem'}}/>
                                </Button>
                            </Grid>
                        </Grid>
                    </CardActions>
                </Card>
            </Col>
        </>
    );
}
