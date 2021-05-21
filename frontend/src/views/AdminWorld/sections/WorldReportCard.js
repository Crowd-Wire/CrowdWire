import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
});

export default function WorldReportCard(props) {

    const classes = useStyles();

    const handleBan = () => {
        console.log("Ban");
    }

    const handleReview = () => {
        console.log("Review");
    }

    return (
        <Card className={classes.root}>
            <CardActionArea>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {props.report.world_id}
                    </Typography>
                    <Typography variant="subtitle1">
                        {props.report.reporter} {props.report.timestamp}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        {props.report.comment}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button onClick={handleBan} size="small" color="primary">
                    Ban
                </Button>
                <Button onClick={handleReview} size="small" color="primary">
                    Review
                </Button>
            </CardActions>
        </Card>
    )
}
