import React, {Component} from "react";
import { Navigate } from 'react-router-dom';
import { Typography } from "@material-ui/core";
import { createBrowserHistory } from 'history';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import WorldService from "services/WorldService";
import DeleteIcon from '@material-ui/icons/Delete';
import Carousel from 'components/AvatarCarousel/AvatarCarousel.js';
import TextField from '@material-ui/core/TextField';
import { ReportWorldCard } from 'components/ReportWorldCard/ReportWorldCard'
import ReportIcon from '@material-ui/icons/Report';
import Button from "components/CustomButtons/Button.js";


class DashboardStats extends Component{
    
    constructor(props){
        super(props);
        this.state = {
            show: false,
            dialog: false,
            nav: false,
            open: false
        }
    }
    
    transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="up" ref={ref} {...props} />;
    });

    descText = {
        marginLeft:"5%",
        color:"black",
    };
    
    titleText = {
        marginLeft:"5%"
    };

    handleClickOpen = () => {
        this.setState({open: true});        
    };
    
    handleClose = () => {
        this.setState({open: false});        
    };
    
    hideModal = () => {
        this.setState({show: false});        
    }

    hideModalandDelete = () => {
        WorldService.deleteWorld(this.props.details.world_id);
        this.setState({show: false});
        let hist = createBrowserHistory();
        hist.back();
    }
    
    showModal = () => {
        this.setState({show: true});        
    }


    hideDialog = () => {
        this.setState({dialog: false});        
    }

    showDialog = () => {
        this.setState({dialog: true});        
    }
    
    showWorldManagement = () => {
        this.setState({nav:true});
    }
    render(){
        if(this.state.nav){
            return <Navigate to={"/world/"+this.props.details.world_id+"/settings"}></Navigate>
        }
        return(
            <>    
                <div style={{width: "100%"}}>
                    <br/>
                    <Row sm={12}>
                        <Col xs={6} sm={6} md={6}>
                            <Row>
                                <Button color="success" size="lg" round>
                                    <span style={{fontWeight: 600, fontSize: '1rem'}}>Enter Map</span>
                                </Button>
                                <div style={{paddingLeft: 20}}>
                                    <Button color="primary" onClick={() => {this.showDialog()}}>
                                        <span style={{fontWeight: 500, fontSize: '0.9rem'}}>Edit Map</span>
                                    </Button>
                                </div>
                                <div style={{paddingLeft: 20}}>
                                    <Button color="primary" onClick={() => {this.showWorldManagement()}}>
                                        <span style={{fontWeight: 500, fontSize: '0.9rem'}}>Manage Map</span>
                                    </Button>
                                </div>
                            </Row>
                        </Col>
                        <Col xs={6} sm={6} md={6}>
                            <Row style={{float: "right"}}>
                                <Button color="github" onClick={() => {this.handleClickOpen()}}>
                                    <span style={{fontWeight: 500, fontSize: '0.9rem'}}>Report World</span>
                                    <ReportIcon/>
                                </Button>
                                <div style={{paddingLeft: 20}}><Button color="danger" onClick={() => {this.showModal()}}>
                                    <span style={{fontWeight: 500, fontSize: '0.9rem'}}>Delete World</span>
                                </Button></div>
                                <ReportWorldCard open={this.state.open} closeModal={this.handleClose}
                                    world_name={this.props.details.name} world_id={this.props.details.world_id} inside_world={false}/>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={{marginTop:"50px"}} xs={12} sm={12} md={12}>
                        <Typography variant="body1" className={this.descText}>{this.props.details.description ? this.props.details.description : "No description available for this world"}</Typography>
                    </Row>
                </div>
                <Dialog
                    open={this.state.show}
                    TransitionComponent={this.transition}
                    keepMounted
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Are you sure you want to delete this world?
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Col>
                            <Row>
                                <Button onClick={this.hideModal} color="primary" style={{marginLeft:"auto", marginRight:"auto"}}>
                                    Disagree
                                </Button>
                            </Row>
                        </Col>
                        <Col>
                            <Row>
                                <Button 
                                    onClick={this.hideModalandDelete}
                                    startIcon={<DeleteIcon />} 
                                    color="secondary" 
                                    style={{marginLeft:"auto", marginRight:"auto"}}
                                >
                                    Agree
                                </Button>
                            </Row>
                        </Col>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={this.state.dialog}
                    TransitionComponent={this.transition}
                    keepMounted
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                    maxWidth="xl"
                >
                    <DialogContent style={{minWidth:"400px"}}>
                    <DialogTitle id="alert-dialog-slide-description" style={{marginLeft:"auto", marginRight:"auto", textAlign:"center"}}>
                        World Profile
                    </DialogTitle>
                        <Col>
                            <Row style={{marginBottom:"15px"}}>
                                <Col>
                                    <Carousel/>
                                </Col>
                            </Row>
                            <Row>
                                <TextField style={{marginLeft:"auto", marginRight:"auto"}} id="outlined-basic" label="username" variant="outlined" />
                            </Row>
                        </Col>
                    </DialogContent>
                    <DialogActions>
                        <Row style={{marginLeft:"auto", marginRight:"auto"}}>
                            <Button onClick={this.hideDialog} color="primary" style={{marginLeft:"auto", marginRight:"auto"}}>
                                Disagree
                            </Button>
                        </Row>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

export default (DashboardStats);