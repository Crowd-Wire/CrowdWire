import React, { Component } from 'react';
import WorldService from 'services/WorldService.ts';
import WorldReportCard from 'components/WorldReportCard/WorldReportCard.js';
import { Row, Col } from 'react-bootstrap';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Link, useNavigate } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const useStyles = theme => ({    
    root: {
        maxWidth: 345,
    },
    media: {
        paddingTop: "30%",
    },
});

class AdminWorldDetails extends Component {

    constructor(props) {
        super(props);
        this.state = { world: null, reports: [], url_id: null }
    }

    goBack(){
                const history = createBrowserHistory();
        history.back();
    } 

    componentDidMount() {
        // returns the world_id based on the url
        let world_id = window.location.pathname.split('/').pop();
        this.setState({url_id: world_id})
        // retrieves the world details
        WorldService.getWorldDetails(world_id)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                // TODO: handle errors
                if(!res.detail){
                    this.setState({ world: res });
                }
            }).then(() => {
                // retrieves the most recent reports
                if(this.state.world){
                //if (this.state.world.status !== 2)
                    WorldService.getAllReports(
                        world_id, null, null, this.state.world.status == 0 ? false : true,
                        'timestamp', 'desc', 1, 3)
                        .then((res) => { return res.json() })
                        .then((res) => {
                            if(!res.detail){
                                this.setState({ reports: res })
                            }
                            
                        })
                }
            })
    }

    handleBan = () => {
        WorldService.banWorld(this.state.world.world_id, this.state.world.status == 0 ? 1 : 0)
            .then((res) => { return res.json(); })
            .then((res) => {
                if(!res.detail){
                    this.setState({ world: { ...this.state.world, status: res.status } });
                }
            })
    }

    render() {
        const { classes } = this.props;

        return (
            <>
                {!this.state.world ? <h1>Loading</h1> :
                    <div className="px-3" style={{ paddingTop: "30px", height:"100%", width:"100%"}}>
                        <Row style={{ marginLeft:"auto", marginRight:"auto"}}>
                        <IconButton style={{border:"white solid 1px",borderRadius:"10px",height:"50px", width:"50px"}} onClick={() => {this.goBack()}}>
                            <ArrowBackIcon style={{height:"40px", width:"40px", marginTop:"auto", color:"white", marginBottom:"auto"}}/>
                        </IconButton>
                        </Row>
                        <Row style={{height:"100%"}}>
                            <Col sm={12} md={8} style={{marginBottom:"50px"}}>
                                <Row style={{height:"70%"}}>
                                    <Col>
                                        <h3>World Details</h3>
                                        <Card style={{height:"90%"}}>
                                            {this.state.world.status == 2
                                                ? <h1>This world has been deleted by the user</h1> :
                                                <>
                                                    <CardContent>
                                                        <CardMedia
                                                            className={classes.media}
                                                            image={
                                                                this.state.world.profile_image === null ? 
                                                                    "https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg"
                                                                :
                                                                    this.state.world.profile_image
                                                                }
                                                            title="Contemplative Reptile"
                                                        />
                                                        <Typography gutterBottom variant="h4" component="h2" style={{marginTop:"15px"}}>
                                                            {this.state.world.name}
                                                        </Typography>
                                                        <Typography variant="body2" component="p">
                                                            Created by: <Link to={'/admin/users/' + this.state.world.creator}>{this.state.world.creator}</Link>
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary" component="p">
                                                            {this.state.world.description}
                                                        </Typography>
                                                    </CardContent>
                                                    <CardActions>
                                                        <Button onClick={this.handleBan} size="small" variant="contained" color={this.state.world.status == 0 ? "primary" : 'secondary'}>
                                                            {this.state.world.status == 0 ? "Ban" : "Unban"}
                                                        </Button>
                                                        <Link to={"/admin/worlds/"+this.state.world.world_id+"/statistics"}><Button size="small" variant="contained" color="primary">View statistics</Button></Link>
                                                    </CardActions>
                                                </>
                                            }
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={12} md={4}>
                                <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                                    <h3 style={{marginLeft:"auto", marginRight:"auto"}}> Last World Reports </h3>
                                </Row>
                                <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                                    {this.state.reports && this.state.reports.length !== 0 ? this.state.reports.map((r, i) => {

                                        return (
                                        <div className="md-3" key={r.reporter} style={{overflowY:"auto", marginLeft:"auto", marginRight:"auto"}}>
                                            <WorldReportCard report={r} />
                                        </div>)

                                    }) : <h2>No reports found...</h2>}
                                </Row>
                                
                            </Col>
                        </Row>
                    </div>
                }
            </>
        )
    }
}

export default withStyles(useStyles)(AdminWorldDetails);