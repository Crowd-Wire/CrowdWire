import React, { Component } from 'react';
import WorldService from 'services/WorldService.js';
import WorldReportCard from 'components/WorldReportCard/WorldReportCard.js';
import { Row, Col } from 'react-bootstrap';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

const useStyles = theme => ({    
    root: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
});

class AdminWorldDetails extends Component {

    constructor(props) {
        super(props);
        this.state = { world: null, reports: [] }
    }

    componentDidMount() {
        // returns the world_id based on the url
        let world_id = window.location.pathname.split('/').pop();

        // retrieves the world details
        WorldService.getWorldDetails(world_id)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                // TODO: handle errors
                this.setState({ world: res });
            }).then(() => {
                // retrieves the most recent reports
                if (this.state.world.status !== 2)
                    WorldService.getAllReports(
                        world_id, null, null, this.state.world.status == 0 ? false : true,
                        'timestamp', 'desc', 1, 3)
                        .then((res) => { return res.json() })
                        .then((res) => {
                            this.setState({ reports: res })
                        })
            })
    }

    handleBan = () => {
        WorldService.banWorld(this.state.world.world_id, this.state.world.status == 0 ? 1 : 0)
            .then((res) => { return res.json(); })
            .then((res) => {
                console.log(res);
                this.setState({ world: { ...this.state.world, status: res.status } });
            })
    }

    render() {
        const { classes } = this.props;

        return (
            <>
                {!this.state.world ? <h1>Loading</h1> :
                    <div className="px-3" style={{ paddingTop: "100px", height:"100%", backgroundColor:"black"}}>
                        <Row style={{height:"100%"}}>
                            <Col md={8}>
                                <Row style={{height:"100%"}}>
                                    <Col>
                                        <h3>World Details</h3>
                                        <Card style={{height:"100%"}}>
                                            {this.state.world.status == 2
                                                ? <h1>This world has been deleted by the user</h1> :
                                                <>
                                                    <CardContent>
                                                        <CardMedia
                                                            className={classes.media}
                                                            image="/static/images/cards/contemplative-reptile.jpg"
                                                            title="Contemplative Reptile"
                                                        />
                                                        <Typography gutterBottom variant="h5" component="h2">
                                                            {this.state.world.name}
                                                        </Typography>
                                                        <Typography variant="body2" component="p">
                                                            Created by: <Link to='/'>{this.state.world.creator}</Link>
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary" component="p">
                                                            {this.state.world.description}
                                                        </Typography>
                                                    </CardContent>
                                                    <CardActions>
                                                        <Button onClick={this.handleBan} size="small" variant="contained" color={this.state.world.status == 0 ? "primary" : 'secondary'}>
                                                            {this.state.world.status == 0 ? "Ban" : "Unban"}
                                                        </Button>
                                                        <Link to="/admin/statistics"><Button size="small" variant="contained" color="primary">View statistics</Button></Link>
                                                    </CardActions>
                                                </>
                                            }
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md="4">
                                <h3> Last World Reports </h3>
                                {this.state.reports && this.state.reports.length !== 0 ? this.state.reports.map((r, i) => {

                                    return (<div className="mb-3" key={r.reporter}>
                                        <WorldReportCard report={r} />
                                    </div>)

                                }) : <h2>No reports found...</h2>}
                            </Col>
                        </Row>
                    </div>
                }
            </>
        )
    }
}

export default withStyles(useStyles)(AdminWorldDetails);