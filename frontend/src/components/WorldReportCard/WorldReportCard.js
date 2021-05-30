import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import WorldService from '../../services/WorldService.js';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
        marginLeft:"auto",
        marginRight:"auto"
    },
    media: {
        height: 140,
    },
});

export default function WorldReportCard(props) {

    const [report, setReport] = React.useState(props.report);
    const [visible, setVisible] = React.useState(true);
    const classes = useStyles();
    const navigate = useNavigate();

    const handleReview = () => {
        WorldService.reviewWorldReport(report.reported, report.reporter, !report.reviewed)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if (res && res.reporter) {
                    setReport({ ...report, reviewed: res.reviewed });
                    setVisible(false);
                }
            })
    }

    const goToDetails = () => {
        // repor.reported = world_id
        navigate("/admin/worlds/" + report.reported);
    }

    return (
        <>
            {visible ? <Card className={classes.root}>
                <CardActionArea onClick={goToDetails}>
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
                    <Button onClick={handleReview} size="small" variant="contained" style={{marginLeft:"auto", marginRght:"30px"}} color={report.reviewed ? "secondary" : "primary"}>
                        {report.reviewed ? "Remove Review" : "Review"}
                    </Button>
                </CardActions>
            </Card> : <></>}
        </>
    )
}
