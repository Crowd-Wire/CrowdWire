import React from "react";
// @material-ui/core components
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
import AuthenticationService from "services/AuthenticationService";
import { toast } from 'react-toastify';
import Typography from "@material-ui/core/Typography"
import useAuthStore from "stores/useAuthStore";

const useStyles = makeStyles(styles);

class RegisterPage extends React.Component {


  constructor(props) {
    super(props);
    this.state = { 
      cardAnimaton: "", 
      navigate: false,
      emailHelperText: "",
      nameHelperText: "",
      passHelperText: "",
      cPassHelperText: "",
      birthdayHelperText: ""
    }
  }


  componentDidMount() {
    this.setState({ cardAnimaton: "cardHidden" })
  }

  timer = setTimeout(() => {
    this.setState({ cardAnimaton: "" })
  }, 700

  );

  notify = () => {
    toast.success("Register Successful! 🎉", {
      position: toast.POSITION.TOP_CENTER
    });
  };

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
    let email = document.getElementById("email").value
    let pass = document.getElementById("cpass").value;
    let cpass = document.getElementById("pass").value;
    let name = document.getElementById("name").value;
    let date = document.getElementById("date").value;
    let dDate = new Date(date);
    let passed = true;


    if(pass !== cpass){
      console.log(this.state.passHelperText)
      this.setState({passHelperText: "Passwords do not match.",cPassHelperText: "Passwords do not match."})
      passed = false;
    }
    else if(!pass){
      this.setState({passHelperText: "Password needed to register."});
      passed = false;
    }
    else
      this.setState({passHelperText: "",cPassHelperText:""});

    if(!email){
      this.setState({emailHelperText:"Email needed to register."});
      passed = false;
    }
    else
      this.setState({emailHelperText:""});
    if(!name){
      console.log("name required")
      this.setState({nameHelperText:"Name needed to register."});
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
      AuthenticationService.register(
        email,
        pass,
        name,
        date
      )
      .then(
        (res) => {
          console.log(res.status);
          return res.json();
        }
        )
      .then(
        (res) => {
          console.log(res);
          if(true)
          this.handleLogin(document.getElementById("email").value, document.getElementById("pass").value); 
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
        <div
          className={this.props.classes.pageHeader}
          style={{
            backgroundImage: "url(" + image + ")",
            backgroundSize: "cover",
            backgroundPosition: "top center"
          }}
        >
          <div className={this.props.classes.container}>
            <GridContainer justify="center">
              <GridItem xs={12} sm={12} md={4}>
                <Card className={this.props.classes[this.state.cardAnimaton]}>
                  <form className={this.props.classes.form}>
                    <CardHeader style={{ backgroundColor: "#5BC0BE" }} className={this.props.classes.cardHeader}>
                      <h4>Register</h4>
                      <div className={this.props.classes.socialLine}>
                        <Button
                          justIcon
                          target="_blank"
                          color="transparent"
                          style={{ border: "1px solid #476385" }}
                          onClick={e => e.preventDefault()}
                        >
                          <i className={"fab fa-google"} />
                        </Button>
                      </div>
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
                        defaultValue="2017-05-24"
                        className={this.props.classes.textField}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </CardBody>
                    <CardFooter className={this.props.classes.cardFooter}>
                      <Button size="md"
                        onClick={this.handleSubmit} 
                      >
                        Submit
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </GridItem>
            </GridContainer>
          </div>
          <Footer whiteFont />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(RegisterPage);