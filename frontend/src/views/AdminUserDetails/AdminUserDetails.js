import React from 'react';
import { Box, Grid, Container, Card, CardContent, Divider, CardHeader, TextField } from '@material-ui/core';
import UserService from 'services/UserService';
import ReportService from 'services/ReportService';
import WorldService from 'services/WorldService';
import MapCard from 'components/MapCard/MapCard.js';

export default function AdminUserDetails() {


    const [user, setUser] = React.useState(null);
    const [worlds, setWorlds] = React.useState([]);

    React.useEffect(() => {
        UserService.getUserDetails(1)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                // TODO: handle errors
                console.log(res);
                setUser(res);
            })
            .then(() => {
                WorldService.searchAdmin("", [], true, true, true, 1 , null, null, 1, 3)
                .then((res) => {
                    return res.json();
                })
                .then((res) => {
                    // TODO: handle errors
                    console.log(res);
                    setWorlds(res);
                })
            })

    }, []);

    return (
        <>
            { user !== null ?
                <div style={{ marginTop: '100px' }}>
                    <Box sx={{ backgroundColor: 'background.default', minHeight: '100%', py: 3 }}>
                        <Container maxWidth="lg">
                            <Grid container>
                                <Grid item lg={8} md={12} xs={12}>
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
                                <Grid className="px-4" item lg={4} md={12} xs={12}>
                                    <h3>User Reports</h3>


                                </Grid>
                                <Grid className="my-4" item lg={8} md={12} xs={12}>
                                    <Card>
                                        <CardHeader subheader="Worlds" />
                                        <Divider />
                                        <CardContent>
                                            {worlds.map((m,i) => {
                                                return(
                                                    <MapCard map={m} key={m.name} />
                                                )
                                            })}
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
