import React, {Component} from "react";
import { Navigate } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slide from '@material-ui/core/Slide';
import WorldService from "services/WorldService.ts";
import DeleteIcon from '@material-ui/icons/Delete';
import { ReportWorldCard } from 'components/ReportWorldCard/ReportWorldCard'
import ReportIcon from '@material-ui/icons/Report';
import BuildIcon from '@material-ui/icons/Build';
import AssignmentIcon from '@material-ui/icons/Assignment';
import Button from "components/CustomButtons/Button.js";
import { withRouter } from "utils/wrapper";
import useAuthStore from "stores/useAuthStore.ts";


class DashboardStats extends Component{
    
    constructor(props){
        super(props);
        this.state = {
            show: false,
            nav: false,
            open: false,
            page: false,
            guest: useAuthStore.getState().guest_uuid
        }
        this.navigate = props.navigate;
        this.params = props.params;
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

    changePage = () => {
        this.setState({stats: true})
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
        if (this.state.stats){
            return <Navigate to={"/world/"+this.props.details.world_id+"/statistics"}></Navigate>
        }
        return(
            <>    
                <div style={{width: "100%", paddingLeft: 15}}>
                    { this.props.isCreator || this.props.canManage ? 
                        <Row sm={12}>
                            {/* <Link to={"/world/"+this.props.details.world_id+"/statistics"}> */}
                            <Button color="warning" onClick={() => this.changePage()} style={{ marginLeft: "auto", marginRight: "auto", width: 180}} round>
                                <span style={{fontWeight: 500, fontSize: '0.9rem'}}>Check Statistics</span>
                            </Button>
                        </Row>
                    : ''
                    }
                    { this.props.canManage ? 
                        <Row sm={12}>
                            <Button color="primary" onClick={() => {this.showWorldManagement()}} style={{ marginLeft: "auto", marginRight: "auto", width: 180}} round>
                                <span style={{fontWeight: 500, fontSize: '0.9rem'}}><AssignmentIcon/>Manage World</span>
                            </Button>
                        </Row>
                    : ''
                    }
                    { this.props.isCreator ? 
                        <Row sm={12}>
                            <Button color="primary" onClick={() => this.navigate('/world/' + this.params.id + '/editor')} style={{ marginLeft: "auto", marginRight: "auto", width: 180}} round>
                                <span style={{fontWeight: 500, fontSize: '0.9rem'}}><BuildIcon/>Edit World</span>
                            </Button>
                        </Row>
                    : ''
                    }
                    { !this.state.guest ?
                    <Row sm={12}>
                        <Button color="github" onClick={() => {this.handleClickOpen()}} style={{ marginLeft: "auto", marginRight: "auto", width: 180}} round>
                            <span style={{fontWeight: 500, fontSize: '0.9rem'}}><ReportIcon/>Report World</span>
                        </Button>
                        <ReportWorldCard open={this.state.open} closeModal={this.handleClose}
                            world_name={this.props.details.name} world_id={this.props.details.world_id} inside_world={false}/>
                    </Row>
                    : '' }
                    { this.props.isCreator ? 
                        <Row sm={12}>
                            <Button color="danger" onClick={() => {this.showModal()}} style={{ marginLeft: "auto", marginRight: "auto", width: 180}} round>
                                <span style={{fontWeight: 500, fontSize: '0.9rem'}}>Delete World</span>
                            </Button>
                        </Row>
                    : ''
                    }
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

export default withRouter(DashboardStats);