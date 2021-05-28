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
        user: null
    }
}

    componentDidMount() {
        this.setState({ cardAnimaton: "cardHidden" })
        UserService.getUserInfo()
        .then((res) => {
            if (res.status == 200)
                return res.json();
        })
        .then( (res) => {
            if (res)
                this.setState({
                    user: res
                });
            console.log(res)
        }).catch((error) => {useAuthStore.getState().leave()});
    }

    timer = setTimeout(() => {
        this.setState({ cardAnimaton: "" })
    }, 700

    );
    
    render() {
        return (
        <div>
            <div className={this.props.classes.container}>
            { this.state.user == null ? "" : 
            <GridContainer justify="center">
                <GridItem xs={12} sm={12} md={12}>
                <Card className={this.props.classes[this.state.cardAnimaton]}>
                    <form className={this.props.classes.form}>
                    <CardHeader style={{ backgroundColor: "#5BC0BE" }} className={this.props.classes.cardHeader}>
                        <h4>Update Account</h4>
                    </CardHeader>
                    <p className={this.props.classes.divider}>Or Be Classical</p>
                    <CardBody>
                        <CustomInput
                        helperText={this.state.emailHelperText}
                        labelText="Email..."
                        id="email"
                        formControlProps={{
                            fullWidth: true
                        }}
                        inputProps={{
                            type: "email",
                            value: this.state.user.email,
                            endAdornment: (
                            <InputAdornment position="end">
                                <Email className={this.props.classes.inputIconsColor} />
                            </InputAdornment>
                            )
                        }}
                        />
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
                            fullWidth: true
                        }}
                        
                        inputProps={{
                            type: "text",
                            value: this.state.user.name,
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
                        <CustomInput
                        helperText={this.state.passHelperText}
                        labelText="Password"
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
                        labelText="Confirm Password"
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
                        Submit
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