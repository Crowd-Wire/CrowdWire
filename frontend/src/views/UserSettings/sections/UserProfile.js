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
import UserService from "../../../services/UserService"
import useAuthStore from "stores/useAuthStore";



class UserProfile extends React.Component {
    constructor(props){
        super(props);
    
    this.state = {
        cardAnimation: "",
        cardAnimaton: "", 
        navigate: false,
        emailHelperText: "",
        nameHelperText: "",
        passHelperText: "",
        birthdayHelperText: "",
        user: null,
        email_val: "",
        name_val: "",
        bdate_val: "",
        is_auth_google: false,
    }
}
    notify = () => {
        toast.success("Successfully Updated Account! 🎉", {
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
                    email_val: res.email,
                    name_val: res.name,
                    bdate_val: res.birth,
                });
            if(res.sub){
                console.log("google auth");
                this.setState({is_auth_google: true});
            }
            }
            console.log(res)
        }).catch((error) => {useAuthStore.getState().leave()});
    }

    timer = setTimeout(() => {
        this.setState({ cardAnimaton: "" })
    }, 700

    );

    handleSubmit = () => {
        let email = document.getElementById("email").value
        let name = document.getElementById("name").value;
        let bdate = document.getElementById("date").value;
        let dDate = new Date(bdate);
        let passed = true;

        if(email.length == 0){
            this.setState({emailHelperText:"Email needs to have at least 1 character."});
            passed = false;
        }
            this.setState({emailHelperText:""});
        if(name.length == 0){
            this.setState({nameHelperText:"Name needs to have at least 1 character."});
            passed = false;
        }
        else
            this.setState({nameHelperText:""});

        if(dDate > new Date()){
            console.log("date must be past")
            this.setState({birthdayHelperText:"Birthdays are in the past."});
            passed = false;
        }
        else
            this.setState({birthdayHelperText:""});

        if(passed){
            UserService.updateUserInfo(
            this.state.user.user_id,
            email,
            name,
            bdate
            )
            .then(
            (res) => {
                console.log(res.status);
                return res.json();
            }
            )
            .then(
            (res) => {
                this.setState({email_val: res.email, name_val: res.name, bdate_val: res.birth})
                this.notify()
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
            { this.state.user == null ? "" : 
            <GridContainer style={{marginTop: 50}} justify="center">
                <GridItem xs={12} sm={12} md={12} lg={12}>
                <Card className={this.props.classes[this.state.cardAnimaton]}>
                    <form className={this.props.classes.form}>
                    <CardHeader style={{ backgroundColor: "#5BC0BE" }} className={this.props.classes.cardHeader}>
                        <h4>Edit Account info</h4>
                    </CardHeader>
                    <CardBody>
                        {this.state.is_auth_google ? "": 
                        <CustomInput
                        helperText={this.state.emailHelperText}
                        labelText="Email..."
                        id="email"
                        formControlProps={{
                            fullWidth: true,
                           
                        }}
                        inputProps={{
                            type: "email",
                            defaultValue: this.state.user.email,
                            endAdornment: (
                            <InputAdornment position="end">
                                <Email className={this.props.classes.inputIconsColor} />
                            </InputAdornment>
                            )
                        }}
                        />
                        }
                        {this.state.emailHelperText!==""?
                        <Typography variant="caption" id="component-error-text" style={{color:"red"}}>{this.state.emailHelperText}</Typography>
                        :
                        <></>
                        }
                        <CustomInput
                        helperText={this.state.nameHelperText}
                        labelText="Name..."
                        id="name"
                        formControlProps={{
                            fullWidth: true,
                        }}
                        
                        inputProps={{
                            type: "text",
                            defaultValue: this.state.user.name,
                            endAdornment: (
                            <InputAdornment position="end">
                                <Email className={this.props.classes.inputIconsColor} />
                            </InputAdornment>
                            )
                        }}
                        />
                        {this.state.nameHelperText!==""?
                        <Typography variant="caption" id="component-error-text" style={{color:"red"}}>{this.state.nameHelperText}</Typography>
                        :
                        <></>
                        }
                        {this.state.cPassHelperText!==""?
                        <Typography variant="caption" id="component-error-text" style={{color:"red"}}>{this.state.cPassHelperText}</Typography>
                        :
                        <></>
                        }
                        <br/>
                        <TextField
                        helperText={this.state.birthdayHelperText}
                        style={{ marginLeft: "auto", marginRight: "auto" }}
                        id="date"
                        label="Birthday"
                        type="date"
                        defaultValue= {this.state.user.birth}
                        className={this.props.classes.textField}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        />
                    </CardBody>
                    <CardFooter className={this.props.classes.cardFooter}>
                        <Button     
                        onClick={this.handleSubmit} 
                        >
                        Submit Changes
                        </Button>
                    </CardFooter>
                    </form>
                </Card>
                </GridItem>
            </GridContainer>
            }
            </div>
            <Footer whiteFont />
        </div>
    );
    }
}
    
    export default withStyles(styles)(UserProfile);