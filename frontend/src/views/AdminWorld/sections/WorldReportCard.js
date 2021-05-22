import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import WorldService from '../../../services/WorldService.js';


const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
});

export default function WorldReportCard(props) {

    const [report, setReport] = React.useState(props.report);
    const classes = useStyles();

    const handleBan = () => {
        console.log("Ban");
        WorldService.banWorld(report.reported, 1)
        .then((res) => {
            // resets the
            if(res.ok)
                props.reset();
        })
    }

    const handleReview = () => {
        console.log("Review");
        WorldService.reviewWorldReport(report.reported, report.reporter, !report.reviewed)
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log(res);
            if(res && res.reporter)
                setReport({...report, reviewed: res.reviewed});
            console.log(report);
        })
    }

    return (
        <Card className={classes.root}>
            <CardActionArea>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {report.world_name}
                    </Typography>
                    <Typography variant="subtitle1">
                        {report.reporter_email} {report.timestamp}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        {report.comment}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button onClick={handleBan} size="small" color="primary">
                    Ban
                </Button>
                <Button onClick={handleReview} size="small" variant="contained" color={report.reviewed ? "primary" : "secondary"}>
                    {report.reviewed ? "Review" : "Remove Review"}
                </Button>
            </CardActions>
        </Card>
    )
}
