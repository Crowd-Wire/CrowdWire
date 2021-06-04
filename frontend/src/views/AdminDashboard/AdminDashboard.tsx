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
import MapIcon from '@material-ui/icons/Map';
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      paddingTop: 200,
      paddingLeft: 80,
      paddingRight: 80,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      height: '100%'
    },
    item: {
      padding: theme.spacing(5),
      textAlign: 'center',
      height: 200,
      width: 300,
      minHeight: 200,
      minWidth: 350,
      maxWidth: 360,
      margin: 'auto'
    },
    card: {
      
    },
  }),
);

export default function AdminUsers() {
    const classes = useStyles();
    const [users, setUsers] = useState(0);
    const [worlds, setWorlds] = useState(0);
    const [userReports, setUserReports] = useState(0);
    const [worldReports, setWorldReports] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState(0);
    const navigation = useNavigate();

    
    useEffect(() => {
      StatisticService.getStatistics()
        .then((res) =>{
            return res.json();
        })
        .then((res) =>{
            if (res.users)
              setUsers(res.users)
            if (res.worlds)
              setWorlds(res.worlds)
            if (res.user_reports)
              setUserReports(res.user_reports)
            if (res.world_reports)
              setWorldReports(res.world_reports)
            if (res.online_users)
              setOnlineUsers(res.online_users)
        })
    }, [])


    return (
        <div className={classes.root}>
          <Grid container spacing={3}>
            <Grid item xs={4} className={classes.item}>
              <Card onClick={() => navigation('/admin/users')} glass hoverType={"down"} outlined bordered className={classes.card}>
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
                  <Row xs={12} style={{top: '70%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', marginRight: 0, marginLeft: 0}}>
                    <Col xs={12}>
                      <Typography style={{color: 'white'}} variant="h3" component="h3" gutterBottom>
                        {users}
                      </Typography>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <Card onClick={() => navigation('/admin/worlds')} glass hoverType={"down"} outlined bordered className={classes.card}>
                <div>
                  <Row xs={12} style={{position: 'absolute', top: 15, width: '100%', marginRight: 0, marginLeft: 0}}>
                    <Col xs={9} style={{top: 5}}>
                      <Typography variant="h6" component="h6" gutterBottom style={{fontWeight: 600, color: 'white'}}>
                        Total Worlds
                      </Typography>
                    </Col>
                    <Col xs={3}>
                        <Avatar style={{backgroundColor: '#0059ff'}}>
                          <MapIcon style={{fontWeight: 600, color: 'white'}}/>
                        </Avatar>
                    </Col>
                  </Row>
                  <Row xs={12} style={{top: '70%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', marginRight: 0, marginLeft: 0}}>
                    <Col xs={12}>
                      <Typography style={{color: 'white'}} variant="h3" component="h3" gutterBottom>
                        {worlds}
                      </Typography>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Grid>
            <Grid item xs={4} className={classes.item}>
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
                  <Row xs={12} style={{top: '70%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', marginRight: 0, marginLeft: 0}}>
                    <Col xs={12}>
                      <Typography style={{color: 'white'}} variant="h3" component="h3" gutterBottom>
                        {onlineUsers}
                      </Typography>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <Card onClick={() => navigation('/admin/users/reports')} glass hoverType={"up"} outlined bordered className={classes.card}>
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
                  <Row xs={12} style={{top: '70%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', marginRight: 0, marginLeft: 0}}>
                    <Col xs={12}>
                      <Typography style={{color: 'white'}} variant="h3" component="h3" gutterBottom>
                        {userReports}
                      </Typography>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <Card onClick={() => navigation('/admin/worlds/reports')} glass hoverType={"up"} outlined bordered className={classes.card}>
                <div>
                  <Row xs={12} style={{position: 'absolute', top: 15, width: '100%', marginRight: 0, marginLeft: 0}}>
                    <Col xs={9} style={{top: 5}}>
                      <Typography variant="h6" component="h6" gutterBottom style={{fontWeight: 600, color: 'white'}}>
                        World Reports
                      </Typography>
                    </Col>
                    <Col xs={3}>
                        <Avatar style={{backgroundColor: 'rgb(216 71 71)'}}>
                          <ReportIcon style={{fontWeight: 600, color: 'white'}}/>
                        </Avatar>
                    </Col>
                  </Row>
                  <Row xs={12} style={{top: '70%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', marginRight: 0, marginLeft: 0}}>
                    <Col xs={12}>
                      <Typography style={{color: 'white'}} variant="h3" component="h3" gutterBottom>
                        {worldReports}
                      </Typography>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Grid>
          </Grid>
        </div>
    )
}
