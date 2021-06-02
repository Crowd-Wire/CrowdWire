import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Email from "@material-ui/icons/Email";
// core components
import TextField from '@material-ui/core/TextField';
// import Header from "components/Header/Header.js";
// import HeaderLinks from "components/Header/HeaderLinks.js";
import Footer from "components/Footer/Footer.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import CardFooter from "components/Card/CardFooter.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import styles from "assets/jss/material-kit-react/views/loginPage.js";
import { withStyles } from "@material-ui/core/styles";
import image from "assets/img/bg8.png";
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import Typography from "@material-ui/core/Typography"
import UserService from "../../../services/UserService";
import AuthenticationService from "../../../services/AuthenticationService";
import useAuthStore from "stores/useAuthStore";



class UpdatePassword extends React.Component {
    constructor(props){
        super(props);
    
    this.state = {
        cardAnimation: "",
        cardAnimaton: "", 
        navigate: false,
        opassHelperText: "",
        passHelperText: "",
        cPassHelperText: "",
        birthdayHelperText: "",
        user: null,
        is_auth_google: false,
    }
}
    notify = () => {
        toast.success("Successfully Updated Password! 🎉", {
        position: toast.POSITION.TOP_CENTER
        });
    };
    componentDidMount() {
        this.setState({ cardAnimaton: "cardHidden" })
        UserService.getUserInfo()
        .then((res) => {
            if (res.status == 200)
                return res.json();
        })
        .then( (res) => {
            if (res){
                this.setState({
                    user: res,
                });
                
            }
            if(res.sub){
                console.log("google auth");
                this.setState({is_auth_google: true});
            }
            console.log(res)
        }).catch((error) => {useAuthStore.getState().leave()});
    }

    timer = setTimeout(() => {
        this.setState({ cardAnimaton: "" })
    }, 700

    );

    handleLogin = (mail, password) => {
        AuthenticationService.login(
            mail, password
        )
        .then(
            (res) => {
            return res.json();
            }
        )
        .then(
            (res) => {
            if(res.access_token!==undefined){
                this.notify();
                AuthenticationService.setToken(res,"AUTH");
            }
            }
        ) 
        }

    handleSubmit = () => {
        let opass = document.getElementById("opass").value
        let pass = document.getElementById("pass").value;
        let cpass = document.getElementById("cpass").value;
        let passed = true;
        console.log(pass);
        console.log(cpass);
        if(pass !== cpass){
            console.log(this.state.passHelperText)
            this.setState({passHelperText: "Passwords do not match.",cPassHelperText: "Passwords do not match."})
            passed = false;
        }
        if(!pass){
            this.setState({passHelperText: "You need to input this password field"});
            passed = false;
        }
        if(!opass){
            this.setState({opassHelperText: "You need to input this password field"});
            passed = false;
        }
        if(!cpass){
            this.setState({cPassHelperText: "You need to input this password field"});
            passed = false;
        }
        else
            this.setState({passHelperText: "",cPassHelperText:"", opassHelperText: ""});

        if(passed){
            UserService.updateUserPassword(
                opass,
                cpass,
            )
            .then(
            (res) => {
                if(res.status == 400){
                    this.setState({opassHelperText: "Your old password is incorrect"});
                }
                if(res.status == 200) {
                    return res.json();
                }
            }
            )
            .then(
            (res) => {
                this.handleLogin(res.email, document.getElementById("pass").value); 
            }
        )
        .catch(
            (error) => {
            console.log(error);

            // TODO: change state to show error;
            }
        );

        }
    }
    render() {
        return (
        <div>
            <div>
            { ( this.state.user == null ? "" : 
            <GridContainer style={{marginTop: 25}} justify="center">
                <GridItem xs={12} sm={12} md={12} lg={12}>
                <Card className={this.props.classes[this.state.cardAnimaton]}>
                    <form className={this.props.classes.form}>
                    <CardHeader style={{ backgroundColor: "#5BC0BE" }} className={this.props.classes.cardHeader}>
                        <h4>Change Password</h4>
                    </CardHeader>
                    <CardBody>
                    {this.state.is_auth_google ? 
                    <Typography variant="caption"
                    id="component-error-text" 
                    style={{color:"black"}}>
                        {"Cannot Update your Password, as you signed in by Google!"}
                        </Typography> : 
                    <div>
                    <CustomInput
                        helperText={this.state.opassHelperText}
                        labelText=" Old Password"
                        id="opass"
                        formControlProps={{
                            fullWidth: true
                        }}
                        inputProps={{
                            type: "password",
                            defaultValue: ".",
                            endAdornment: (
                            <InputAdornment position="end">
                                <Icon className={this.props.classes.inputIconsColor}>
                                lock_outline
                                </Icon>
                            </InputAdornment>
                            ),
                            autoComplete: "off"
                        }}
                        />
                        {this.state.opassHelperText!==""?
                        <Typography variant="caption" id="component-error-text" style={{color:"red"}}>{this.state.opassHelperText}</Typography>
                        :
                        <></>
                        }
                    <CustomInput
                        helperText={this.state.passHelperText}
                        labelText=" New Password"
                        id="pass"
                        formControlProps={{
                            fullWidth: true
                        }}
                        inputProps={{
                            type: "password",
                            endAdornment: (
                            <InputAdornment position="end">
                                <Icon className={this.props.classes.inputIconsColor}>
                                lock_outline
                                </Icon>
                            </InputAdornment>
                            ),
                            autoComplete: "off"
                        }}
                        />
                        {this.state.passHelperText!==""?
                        <Typography variant="caption" id="component-error-text" style={{color:"red"}}>{this.state.passHelperText}</Typography>
                        :
                        <></>
                        }
                        <CustomInput
                        helperText={this.state.cPassHelperText}
                        labelText="Confirm New Password"
                        id="cpass"
                        formControlProps={{
                            fullWidth: true
                        }}
                        inputProps={{
                            type: "password",
                            endAdornment: (
                            <InputAdornment position="end">
                            <Icon className={this.props.classes.inputIconsColor}>
                                lock_outline
                            </Icon>
                            </InputAdornment>
                        ),
                        autoComplete: "off"
                        }}
                    />
                    {this.state.cPassHelperText!==""?
                        <Typography variant="caption" id="component-error-text" style={{color:"red"}}>{this.state.cPassHelperText}</Typography>
                        :
                        <></>
                    }
                    </div>
                    }
                    </CardBody>
                    <CardFooter className={this.props.classes.cardFooter}>
                    {this.state.is_auth_google ? "" : 
                        <Button     
                        onClick={this.handleSubmit} 
                        >
                        Submit Changes
                        </Button>
                    }
                    </CardFooter>
                    </form>
                </Card>
                </GridItem>
            </GridContainer>
            )}
            </div>
            <Footer whiteFont />
        </div>
    );
    }
}
    
    export default withStyles(styles)(UpdatePassword);