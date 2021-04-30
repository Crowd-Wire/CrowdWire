import React, {Component} from "react";
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
import Slide from '@material-ui/core/Slide';
import WorldService from "services/WorldService";
import DeleteIcon from '@material-ui/icons/Delete';

class DashboardStats extends Component{
    
    constructor(props){
        super(props);
        this.state = {
            show: false
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
    
    hideModal = () => {
        console.log("false now");
        this.setState({show: false});        
    }

    hideModalandDelete = () => {
        WorldService.deleteWorld(this.props.details.world_id);
        console.log("false now");
        this.setState({show: false});
        let hist = createBrowserHistory();
        hist.back();
    }
    
    showModal = () => {
        this.setState({show: true});        
    }
    
    
    render(){
        console.log(this.props.details);
        return(
            <>    
                <div style={{height:"fit-content",borderRadius:"15px", width:"100%",}}>
                    <br/>
                    <Row style={{width:"100%",height:"90%"}}>
                        <Col xs={12} sm={10} md={6} style={{marginBottom:"1%"}}>
                            <Row>

                                    <Button variant="success" className={this.actionButtons} style={{marginLeft:"5%",color:"black"}}>Enter Map</Button>
                                    <Button variant="primary" className={this.actionButtons}>Edit Map</Button>
                                    <Button variant="primary " className={this.actionButtons}>Manage Map</Button>

                            </Row>
                            <Row style={{marginTop:"50px"}}>
                                <Typography variant="body1" className={this.descText}>{this.props.details.description}</Typography>
                            </Row>
                        </Col>
                        <Col xs={12} sm={10} md={4} style={{borderRadius:"15px"}}>
                            <Row>
                                <Button variant="danger" onClick={() => {this.showModal()}} style={{marginLeft:"auto"}}>Delete World</Button>
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
            </>
        );
    }
}

export default (DashboardStats);