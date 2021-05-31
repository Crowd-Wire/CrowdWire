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
import PersonIcon from '@material-ui/icons/Person';


class DashboardStats extends Component{
    
    constructor(props){
        super(props);
        this.state = {
            show: false,
            nav: false,
            open: false
        }
    }
    
    transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="up" ref={ref} {...props} />;
    });
    
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
    
    showWorldManagement = () => {
        this.setState({nav:true});
    }
    render(){
        if(this.state.nav){
            return <Navigate to={"/world/"+this.props.details.world_id+"/settings"}></Navigate>
        }
        return(
            <>    
                <div style={{width: "100%", paddingLeft: 15}}>
                    <Row sm={12}>
                        <Col style={{textAlign: 'center'}}>
                            <span style={{fontWeight: 600, fontSize: '1.1rem', paddingBottom: 5}}>
                                <PersonIcon />My World Profile
                            </span>
                            <Carousel/>
                        </Col>
                    </Row>
                    <Row sm={12} style={{paddingTop: 20, paddingBottom: 40}}>
                        <TextField style={{marginLeft:"auto", marginRight:"auto"}} id="outlined-basic" label="username" variant="outlined" />
                    </Row>
                    <Row sm={12}>
                        <Button color="primary" onClick={() => {this.showWorldManagement()}} style={{ marginLeft: "auto", marginRight: "auto", width: 200}} round>
                            <span style={{fontWeight: 500, fontSize: '0.9rem'}}>Manage Map</span>
                        </Button>
                    </Row>
                    <Row sm={12}>
                        <Button color="github" onClick={() => {this.handleClickOpen()}} style={{ marginLeft: "auto", marginRight: "auto", width: 200}} round>
                            <span style={{fontWeight: 500, fontSize: '0.9rem'}}><ReportIcon/>Report World</span>
                        </Button>
                        <ReportWorldCard open={this.state.open} closeModal={this.handleClose}
                            world_name={this.props.details.name} world_id={this.props.details.world_id} inside_world={false}/>
                    </Row>
                    <Row sm={12}>
                        <Button color="danger" onClick={() => {this.showModal()}} style={{ marginLeft: "auto", marginRight: "auto", width: 200}} round>
                            <span style={{fontWeight: 500, fontSize: '0.9rem'}}>Delete World</span>
                        </Button>
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
            </>
        );
    }
}

export default (DashboardStats);