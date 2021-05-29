import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { useNavigate } from 'react-router-dom';

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

    return (
        <Card>
            <CardActionArea onClick={goToDetails}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        ahsahsah
                    </Typography>
                    <Typography variant="subtitle1">
                        aaaaaa
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        aaaa
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button size="small" variant="contained" color="primary">
                    lixo
                </Button>
            </CardActions>
        </Card>
    )
}
