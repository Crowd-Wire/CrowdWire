import React from 'react';
import { Box, Grid, Container, Card, CardContent, Divider, CardHeader, Typography } from '@material-ui/core';
import UserService from 'services/UserService';
import ReportService from 'services/ReportService';
import WorldService from 'services/WorldService';
import MapCard from 'components/MapCard/MapCard.js';
import UserReportCard from 'components/UserReportCard/UserReportCard.js';
import { makeStyles } from '@material-ui/core/styles';
import Col from 'react-bootstrap/Col';
const useStyles = makeStyles((theme) => ({
    paper: {
      padding: theme.spacing(2),
    },
  }));

export default function AdminUserDetails() {


    const [user, setUser] = React.useState(null);
    const [worlds, setWorlds] = React.useState([]);
    const [reports, setReports] = React.useState(null);
    const classes = useStyles();
    React.useEffect(() => {
        console.log(window.location.pathname)
        if(window.location.pathname.split("/").length===4){
            UserService.getUserDetails(window.location.pathname.split("/")[3])
                .then((res) => {
                    return res.json();
                })
                .then((res) => {
                    // TODO: handle errors
                    setUser(res);
                })
                .then(() => {
                    WorldService.searchAdmin("", [], true, true, true, 1 , null, null, 1, 3)
                    .then((res) => {
                        if(res.status!==200)
                            return null;
                        return res.json();
                    })
                    .then((res) => {
                        // TODO: handle errors
                        setWorlds(res);
                    })
                })
            UserService.getUserReports(null, null, window.location.pathname.split("/")[3], null, null, null, 1, 10)
            .then((res)=>{
                if(res.status !== 200)
                    return null;
                return res.json();
            })
            .then((res)=>{
                console.log(res)
                if(res===null || res.length===0){
                    setReports(<Typography variant="body1"><em>No reports to be reviewed</em></Typography>)
                    return;
                }
                setReports(res.map((r,i) => {
                    return(
                        <UserReportCard key={r.reporter + '_' + r.reported + '_' + r.world_id + '_' + r.reviewed} report={r} />
                    )
                }));
            });
        }

        }, []);

    return (
        <>
            { user !== null ?
                <div style={{ paddingTop: '100px', backgroundImage: 'linear-gradient(to bottom right, #2B9BFD 4%, #71d1b9 90%)'}}>
                    <Box sx={{ backgroundColor: 'background.default', minHeight: '100%', py: 3 }}>
                        <Container maxWidth="lg">
                            <Grid container>
                                <Grid item lg={10} md={12} xs={12}>
                                    <Card>
                                        <CardHeader title="User Details" />
                                        <Divider />
                                        <CardContent>
                                            <Grid container spacing={3}>
                                                <Grid item md={12} xs={12}>
                                                    <h6>{user.id}</h6>
                                                </Grid>
                                                <Grid item md={12} xs={12} >
                                                    <h6>{user.email}</h6>
                                                </Grid>
                                                <Grid item md={6} xs={12} >
                                                    <h6>{user.birth ? user.birth: "No Birth"}</h6>
                                                </Grid>
                                                <Grid item md={6} xs={12}>
                                                    <h6>{user.status == 0 ? "Normal" 
                                                    : user.status == 1 ? "Banned" : "Deleted"}</h6>
                                                </Grid>
                                                <Grid item md={6} xs={12}>
                                                    {user.register_date}
                                                </Grid>
                                                <Grid item md={6} xs={12}>
                                                    {user.name}
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                        <Divider />
                                    </Card>
                                </Grid>
                                <Grid className={classes.paper} item lg={5} md={12} xs={12}>
                                    <Card>
                                        <CardHeader subheader="User Reports"/>
                                        <Divider/>
                                        <CardContent>
                                            { reports }
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid className={classes.paper} item lg={5} md={12} xs={12}>
                                    <Card>
                                        <CardHeader subheader="Worlds" />
                                        <Divider />
                                        <CardContent>
                                            <Col style={{marginLeft:"auto", marginRight:"auto"}}>
                                                {worlds.map((m,i) => {
                                                    return(
                                                        <MapCard map={m} key={m.name} />
                                                    )
                                                })}
                                            </Col>
                                        </CardContent>
                                        <Divider />
                                    </Card>
                                </Grid>
                            </Grid>
                        </Container>
                    </Box>
                </div>
                : <h1>Loading</h1>}
        </>
    )
}
