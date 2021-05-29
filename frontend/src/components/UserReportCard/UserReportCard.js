import React from 'react';


const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
});

export default function UserReportCard() {

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
                <Button onClick={handleReview} size="small" variant="contained" color="primary">
                    lixo
                </Button>
            </CardActions>
        </Card>
    )
}
