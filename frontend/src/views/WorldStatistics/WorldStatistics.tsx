import React, { useEffect, useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import StatisticService from 'services/StatisticService';
import { Card } from 'react-card-component';
import Grid from '@material-ui/core/Grid';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import PersonIcon from '@material-ui/icons/Person';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ReportIcon from '@material-ui/icons/Report';
import { WorldGraph } from "components/Statistics/WorldGraph";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import { createBrowserHistory } from 'history';
import CssBaseline from '@material-ui/core/CssBaseline';
import DashDrawer from 'components/DashDrawer/DashDrawer.js';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      paddingTop: 100,
      paddingLeft: 80,
      paddingRight: 80,
      paddingBottom: 200,
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: '100%',
      transform: 'translate(-50%, -50%)',
    },
    item: {
      padding: theme.spacing(2),
      textAlign: 'center',
      height: 180,
      width: 350,
      minHeight: 180,
      minWidth: 350,
      maxWidth: 350,
      margin: 'auto'
    },
    card: {
      
    },
    root1: {
      position:"fixed",
      display: 'flex',
      height:'100%',
      width:'100%',
      overflow:"auto",
      backgroundImage: 'linear-gradient(to bottom right, #2B9BFD 4%, #71d1b9 90%)'
    },
  }),
);


export default function WorldStats() {
    const classes = useStyles();
    const [users, setUsers] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [userReports, setUserReports] = useState(0);
    const [playerJoins, setPlayerJoins] = useState(0);
    const history = createBrowserHistory();
    const window_path = window.location.pathname.split('/')
    
    useEffect(() => {
      StatisticService.getWorldStats(window_path[window_path.length - 2])
        .then((res) => {
            return res.json();
        })
        .then((res) => {
          console.log(res)
          if (res.total_users)
            setUsers(res.total_users)
          if (res.total_n_joins)
            setPlayerJoins(res.total_n_joins)
          if (res.reports_users)
            setUserReports(res.reports_users)
          if (res.online_users)
            setOnlineUsers(res.online_users)
        })
    }, [])

    const goBack = () => {
      history.back();
    } 

    return (
      <div className={classes.root1}>
        <CssBaseline />
        <DashDrawer/>
        <div className={classes.root}>
          <IconButton style={{border:"white solid 1px",borderRadius:"10px",height:"50px", width:"50px"}} onClick={() => {goBack()}}>
            <ArrowBackIcon style={{height:"40px", width:"40px", marginTop:"auto", color:"white", marginBottom:"auto"}}/>
          </IconButton>
          <Grid container spacing={1} style={{paddingBottom: 50}}>
            <Grid item xs={6} className={classes.item}>
              <Card glass hoverType={"down"} outlined bordered className={classes.card}>
                <div>
                  <Row xs={12} style={{position: 'absolute', top: 15, width: '100%', marginRight: 0, marginLeft: 0}}>
                    <Col xs={9} style={{top: 5}}>
                      <Typography variant="h6" component="h6" gutterBottom  style={{fontWeight: 600, color: 'white'}}>
                        Total Users
                      </Typography>
                    </Col>
                    <Col xs={3}>
                        <Avatar style={{backgroundColor: '#002f75'}}>
                          <PersonIcon style={{fontWeight: 600, color: 'white'}}/>
                        </Avatar>
                    </Col>
                  </Row>
                  <Row xs={12} style={{top: '65%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', marginRight: 0, marginLeft: 0}}>
                    <Col xs={12}>
                      <Typography style={{color: 'white'}} variant="h3" component="h3" gutterBottom>
                        {users}
                      </Typography>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <Card glass hoverType={"down"} outlined bordered className={classes.card}>
                <div>
                  <Row xs={12} style={{position: 'absolute', top: 15, width: '100%', marginRight: 0, marginLeft: 0}}>
                    <Col xs={9} style={{top: 5}}>
                      <Typography variant="h6" component="h6" gutterBottom style={{fontWeight: 600, color: 'white'}}>
                        Online Users
                      </Typography>
                    </Col>
                    <Col xs={3}>
                        <Avatar style={{backgroundColor: '#4caf50'}}>
                          <FiberManualRecordIcon style={{fontWeight: 600, color: 'white'}}/>
                        </Avatar>
                    </Col>
                  </Row>
                  <Row xs={12} style={{top: '65%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', marginRight: 0, marginLeft: 0}}>
                    <Col xs={12}>
                      <Typography style={{color: 'white'}} variant="h3" component="h3" gutterBottom>
                        {onlineUsers}
                      </Typography>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Grid>
            <Grid item xs={12} style={{paddingTop: 50, paddingBottom: 50}} >
              <Card glass outlined bordered style={{height: 400, overflow: 'hidden', width: '100%'}}>
                <WorldGraph world_id={window_path[window_path.length - 2]}/>
              </Card>
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <Card glass hoverType={"up"} outlined bordered className={classes.card}>
                <div>
                  <Row xs={12} style={{position: 'absolute', top: 15, width: '100%', marginRight: 0, marginLeft: 0}}>
                    <Col xs={9} style={{top: 5}}>
                      <Typography variant="h6" component="h6" gutterBottom style={{fontWeight: 600, color: 'white'}}>
                        User Reports
                      </Typography>
                    </Col>
                    <Col xs={3}>
                        <Avatar style={{backgroundColor: 'rgb(232 0 0)'}}>
                          <ReportIcon style={{fontWeight: 600, color: 'white'}} />
                        </Avatar>
                    </Col>
                  </Row>
                  <Row xs={12} style={{top: '65%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', marginRight: 0, marginLeft: 0}}>
                    <Col xs={12}>
                      <Typography style={{color: 'white'}} variant="h3" component="h3" gutterBottom>
                        {userReports}
                      </Typography>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <Card glass hoverType={"up"} outlined bordered className={classes.card}>
                <div>
                  <Row xs={12} style={{position: 'absolute', top: 15, width: '100%', marginRight: 0, marginLeft: 0}}>
                    <Col xs={9} style={{top: 5}}>
                      <Typography variant="h6" component="h6" gutterBottom style={{fontWeight: 600, color: 'white'}}>
                        Player Entrances
                      </Typography>
                    </Col>
                    <Col xs={3}>
                        <Avatar style={{backgroundColor: 'rgb(216 71 71)'}}>
                          <ReportIcon style={{fontWeight: 600, color: 'white'}}/>
                        </Avatar>
                    </Col>
                  </Row>
                  <Row xs={12} style={{top: '65%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', marginRight: 0, marginLeft: 0}}>
                    <Col xs={12}>
                      <Typography style={{color: 'white'}} variant="h3" component="h3" gutterBottom>
                        {playerJoins}
                      </Typography>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Grid>
          </Grid>
        </div>
      </div>
    )
}
