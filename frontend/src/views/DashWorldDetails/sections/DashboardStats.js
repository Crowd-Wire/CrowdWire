import React, {Component} from "react";
import { Navigate } from 'react-router-dom';
import { Typography } from "@material-ui/core";
import { createBrowserHistory } from 'history';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
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
    
    actionButtons = {
        marginRight:"10px",
    };
    descText = {
        marginLeft:"5%",
        color:"white",
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
                <div style={{height:"fit-content",borderRadius:"15px", width:"100%",}}>
                    <br/>
                    <Row style={{width:"100%",height:"90%", marginLeft:"auto", marginRight:"auto"}}>
                        <Col xs={12} sm={10} md={6} style={{marginBottom:"1%"}}>
                            <Row>
                                    <Button variant="success" className={this.actionButtons} style={{color:"black"}}>Enter Map</Button>
                                    <Button variant="primary" className={this.actionButtons} onClick={() => {this.showDialog()}} style={{marginLeft:"3%"}}>Edit Map</Button>
                                    <Button variant="primary " className={this.actionButtons} onClick={() => {this.showWorldManagement()}} style={{marginLeft:"3%"}}>Manage Map</Button>
                            </Row>
                            <Row style={{marginTop:"50px"}}>
                                <Typography variant="body1" className={this.descText}>{this.props.details.description ? this.props.details.description : "No description available for this world"}</Typography>
                            </Row>
                        </Col>
                        <Col xs={12} sm={10} md={4} style={{borderRadius:"15px"}}>
                            <Row>
                                <Button variant="danger" onClick={() => {this.handleClickOpen()}} style={{marginLeft:"auto"}}>
                                    Report World<ReportIcon/>
                                </Button>
                                <Button variant="danger" onClick={() => {this.showModal()}} style={{marginLeft:"3%"}}>Delete World</Button>
                                <ReportWorldCard open={this.state.open} closeModal={this.handleClose}
                                world_name={this.props.details.name} world_id={this.props.details.world_id} />
                            </Row>
                        </Col>
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