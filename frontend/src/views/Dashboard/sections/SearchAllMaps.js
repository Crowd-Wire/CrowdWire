import React, { Component } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';

import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import InputAdornment from '@material-ui/core/InputAdornment';

import 'bootstrap/dist/css/bootstrap.min.css';

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
    margin: {
        margin: theme.spacing(2),
      },
}));
export default function DashboardContent(){
    const classes = useStyles();
    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
      };
      const [values, setValues] = React.useState({
        amount: '',
      });
    return(
        <>
            <Container>
                <Row style={{alignContent:"center"}}>
                    <FormControl fullWidth className={classes.margin} variant="outlined" style={{width:"500px"}}>
                        <InputLabel htmlFor="outlined-margin-normal">Search</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-amount"
                            value={values.amount}
                            onChange={handleChange('amount')}
                            startAdornment={<InputAdornment position="start"><SearchIcon/></InputAdornment>}
                            labelWidth={60}
                        />
                    </FormControl>
                </Row>
                <br/>
                <hr/>
                <Row>
                    <Col md={4}>
                        <Card className={classes.root}>
                        <CardActionArea>
                        <CardMedia
                            className={classes.media}
                            image="https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8cGljdHVyZXxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
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
                    <Col md={4}>
                        <Card className={classes.root}>
                        <CardActionArea>
                        <CardMedia
                            className={classes.media}
                            image="https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8cGljdHVyZXxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
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
                    <Col md={4}>
                        <Card className={classes.root}>
                        <CardActionArea>
                        <CardMedia
                            className={classes.media}
                            image="https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8cGljdHVyZXxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
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

                </Row>
            </Container>
        </>
        );
}

