import React from 'react';
import { Box, Grid, Container, Card, CardContent,CardActions, Divider, CardHeader, Typography, Button } from '@material-ui/core';
import UserService from 'services/UserService';
import ReportService from 'services/ReportService';
import WorldService from 'services/WorldService.ts';
import MapCard from 'components/MapCard/MapCard.js';
import UserReportCard from 'components/UserReportCard/UserReportCard.js';
import { makeStyles } from '@material-ui/core/styles';
import Col from 'react-bootstrap/Col';
import { createBrowserHistory } from 'history';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Row from 'react-bootstrap/Row';
import { useNavigate } from "react-router-dom";


const useStyles = makeStyles((theme) => ({
    paper: {
      padding: theme.spacing(2),
    },
  }));

export default function AdminUserDetails() {


    const [user, setUser] = React.useState(null);
    const [worlds, setWorlds] = React.useState([]);
    const [reports, setReports] = React.useState(null);
    const [url_id, setUrlID] = React.useState(null);
    const navigation = useNavigate();
    const classes = useStyles();
    React.useEffect(() => {
        if(window.location.pathname.split("/").length===4){
            let now_url = window.location.pathname;
            setUrlID(now_url.split("/")[3]);
            UserService.getUserDetails(now_url.split("/")[3])
                .then((res) => {
                    return res.json();
                })
                .then((res) => {
                    // TODO: handle errors
                    setUser(res);
                })
                .then(() => {
                    WorldService.searchAdmin("", [], true, true, 1 , null, null, 1, 3)
                    .then((res) => {
                        if (res.status!==200)
                            return null;
                        return res.json();
                    })
                    .then((res) => {
                        // TODO: handle errors
                        if(res && !res.detail) {
                            setWorlds(res);
                        }
                    })                    
                })
            UserService.getUserReports(null, null, window.location.pathname.split("/")[3], null, null, null, 1, 10)
            .then((res)=>{
                if(res.status !== 200)
                    return null;
                return res.json();
            })
            .then((res)=>{
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

    const handleBan = () => {
        
        // sends the other status
        UserService.banUser(user.user_id, user.status ^ 1)
        .then((res) => {
            if(res.ok) {
                setUser((user) => {user.status = user.status ^ 1; return {...user}; });
            }
        })

    }

    const goBack = () => {
        if(window.location.pathname==="/admin/users/"+url_id){
            navigation("/admin/users")
            return;
        }
        const history = createBrowserHistory();
        history.back();
    } 

    return (
        <>
            { user !== null ?
                <div style={{ paddingTop: '30px'}}>
                <Row style={{ marginLeft:"auto", marginRight:"auto"}}>
                  <IconButton style={{border:"white solid 1px",borderRadius:"10px",height:"50px", width:"50px", margin:"30px"}} onClick={() => {goBack()}}>
                    <ArrowBackIcon style={{height:"40px", width:"40px", marginTop:"auto", color:"white", marginBottom:"auto"}}/>
                  </IconButton>
                </Row>
                    <Box sx={{ backgroundColor: 'background.default', minHeight: '100%', py: 3 }}>
                        <Container maxWidth="lg">
                            <Grid container>
                                <Grid item lg={11} md={12} xs={12}>
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
                                        <CardActions>
                                            <Button onClick={handleBan} color={user.status == 0 ? "primary" : "secondary"} variant="contained">
                                                { user.status === 0 ? "Ban" : "Unban" }
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                                <Grid className="mt-3" item lg={5} md={12} xs={12}>
                                    <Card>
                                        <CardHeader subheader="User Reports"/>
                                        <Divider/>
                                        <CardContent>
                                            { reports }
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item lg={1} md={0} xs={0}>
                                </Grid>
                                <Grid className="mt-3" item lg={5} md={12} xs={12}>
                                    <Card>
                                        <CardHeader subheader="Worlds" />
                                        <Divider />
                                        <CardContent>
                                            <Col style={{marginLeft:"auto", marginRight:"auto"}}>
                                                {worlds.map((m,i) => {
                                                    return(
                                                        <MapCard map={m} key={m.name} baseUrl={"../../worlds/"} banned={m.status}/>
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
