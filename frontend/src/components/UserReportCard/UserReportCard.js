import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { useNavigate } from 'react-router-dom';
import ReportService from 'services/ReportService';

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
});

export default function UserReportCard(props) {

    const [report, setReport] = React.useState(props.report);
    const [visible, setVisible] = React.useState(true);
    const classes = useStyles();
    const navigate = useNavigate();

    const goToDetails = () => {

    }

    const handleReview = () => {
        ReportService.reviewUserReport(report.world_id, report.reporter, report.reported, !report.reviewed)
        .then((res) => {
            if(res.ok)
                setVisible(false);
        })
    }

    return (
        <>
        { visible ? 
            <Card style={{marginTop:"5px", marginBottom:"15px"}}>
                <CardActionArea onClick={goToDetails}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {report.reporter_email}
                        </Typography>
                        <Typography variant="subtitle1">
                            {report.reported_email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            {report.world_name}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button onClick={handleReview} size="small" variant="contained" color={ report.reviewed == true ? "secondary" : "primary"}>
                        {report.reviewed ? "Remove Review" : "Review"}
                    </Button>
                </CardActions>
            </Card>
        : <></>}</>
    )
}
