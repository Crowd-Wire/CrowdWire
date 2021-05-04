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
import { useNavigate, Navigate } from "react-router-dom";

const useStyles = makeStyles(styles);


class RegisterPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      cardAnimaton: "", 
      navigate: false,
      emailHelperText: "",
      nameHemplerText: "",
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
        AuthenticationService.setToken(res);
        if(res.access_token!==undefined){
          this.setState({loggedIn:true})
          this.props.changeAuth(true);
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

    console.log(typeof date);

    if(pass !== cpass){
      this.setState({passHelperText: "Passwords do not match.",cPassHelperText: "Passwords do not match."})
      passed = false;
    }
    if(!email){
      this.setState({emailHelperText:"Email needed to register."});
      passed = false;
    }
    if(!name){
      this.setState({nameHelperText:"Name needed to register."});
      passed = false;
    }
    if(dDate > new Date()){
      this.setState({birthdayHelperText:"Birthdays are in the past."});
      passed = false;
    }

    if(passed){
      AuthenticationService.register(
        document.getElementById("email").value,
        pass,
        document.getElementById("name").value,
        document.getElementById("date").value
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
        console.log("e aqui agora com erro");
        console.log("error is "+error);

        // TODO: change state to show error;
      }
    );

    }
  }

  render() {
    if (this.state.loggedIn) {
      return <Navigate to="/dashboard/search" />
    }
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
                      <CustomInput
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
                      <CustomInput
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
                      <CustomInput
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
                      <TextField
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