import React, { Component } from 'react';
import WorldService from 'services/WorldService.js';
import WorldReportCard from 'components/WorldReportCard/WorldReportCard.js';
import { Row, Col } from 'react-bootstrap';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {Link} from 'react-router-dom';
const useStyles = makeStyles({
    root: {
        maxWidth: 345,
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
        console.log(world_id);

        // retrieves the world details
        WorldService.getWorldDetails(world_id)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                // TODO: handle errors
                this.setState({ world: res });
                console.log(res);
            }).then(() => {
                // retrieves the most recent reports
                WorldService.getAllReports(
                    world_id, null, null, this.state.world.status == 0 ? false : true,
                    'timestamp', 'desc', 1, 3)
                    .then((res) => { return res.json() })
                    .then((res) => {
                        this.setState({ reports: res })
                    })
            })
    }


    render() {
        return (
            <div className="px-3" style={{ marginTop: "100px" }}>
                <Row>
                    <Col md="8">
                        <h3>World Details</h3>
                        {!this.state.world ? <h1>Loading</h1> :
                            <Card>

                                <CardContent>
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
                                    <Button size="small" color="primary">
                                        {this.state.world.status == 0 ? "Ban" : "Unban" }
                                    </Button>
                                </CardActions>
                            </Card>
                        }
                    </Col>
                    <Col md="4">
                        <h3> Last World Reports </h3>
                        {this.state.reports.length !== 0 ? this.state.reports.map((r, i) => {

                            return (<div className="mb-3" key={r.reporter}>
                                <WorldReportCard report={r} />
                            </div>)

                        }) : <h2>No reports found...</h2>}
                    </Col>
                </Row>
            </div>
        )
    }
}

export default withStyles(useStyles)(AdminWorldDetails);