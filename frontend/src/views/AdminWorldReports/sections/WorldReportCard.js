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
        WorldService.banWorld(report.reported, report.banned == 0 ? 1 : 0 )
        .then((res) => {
            // resets the
            if(res.ok)
                props.reset();
        })
    }

    const handleReview = () => {
        WorldService.reviewWorldReport(report.reported, report.reporter, !report.reviewed)
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            if(res && res.reporter){
                setReport({...report, reviewed: res.reviewed});
                props.reset();
            }
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
                <Button onClick={handleBan} size="small" color={report.banned ? "primary" : "secondary"}>
                    {report.banned ? "Remove Ban" : "Ban"}
                </Button>
                <Button onClick={handleReview} size="small" variant="contained" color={report.reviewed ? "secondary" : "primary"}>
                    {report.reviewed ? "Remove Review" : "Review"}
                </Button>
            </CardActions>
        </Card>
    )
}
