import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import { useNavigate, Link, Navigate } from 'react-router-dom';
import InputAdornment from "@material-ui/core/InputAdornment";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Email from "@material-ui/icons/Email";
// core components
// import Header from "components/Header/Header.js";
// import HeaderLinks from "components/Header/HeaderLinks.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import CardFooter from "components/Card/CardFooter.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import AuthenticationService from "services/AuthenticationService.js";
import styles from "assets/jss/material-kit-react/views/loginPage.js";
import { withStyles } from "@material-ui/core/styles";
import image from "assets/img/bg8.png";
import Typography from "@material-ui/core/Typography"
import { toast } from 'react-toastify';
import GoogleLogin from 'react-google-login';
import useAuthStore from "stores/useAuthStore";
import { createBrowserHistory } from 'history';


class LoginPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      cardAnimaton: "",
      navigate: false,
      emailSt:"",
      passwSt:"",
    }
  }


  componentDidMount() {
    this.setState({ cardAnimaton: "cardHidden" })
  }

  timer = setTimeout(() => {
    this.setState({cardAnimaton:""})},300

  );

  goBack(){
    const history = createBrowserHistory();
    history.back();
  } 
  

  notify = (authType) => {
    if(authType==="Auth"){
      toast.success("Login Successful!", {
        position: toast.POSITION.TOP_CENTER
      });
    }
    else if(authType==="Guest"){
      toast.info("Joined as Guest!", {
        position: toast.POSITION.TOP_CENTER
      });
    }
  };

  handleSubmit = () => {

    AuthenticationService.login(
      document.getElementById("email").value,
      document.getElementById("pass").value
    )
    .then(
      (res) => {
        return res.json();
      }
    )
    .then(
      (res) => {
        if(res.access_token!==undefined){
          this.notify("Auth");
          AuthenticationService.setToken(res,"AUTH");
        }
        else if(res.detail === "Invalid email or password.")
          this.setState({passwSt: res.detail,emailSt: res.detail});
        else if(res.detail instanceof Object && res.detail.length===1 & res.detail[0].loc[1]==="username")
          this.setState({passwSt:"", emailSt:"Email Required"});
        else if(res.detail instanceof Object && res.detail.length===1 & res.detail[0].loc[1]==="password")
          this.setState({passwSt:"Password Required", emailSt:""});
        else if(res.detail instanceof Object && res.detail.length===2 & res.detail[0].loc[1]==="username" && res.detail[1].loc[1]==="password")
          this.setState({passwSt:"Password Required", emailSt:"Email Required"});
        else if(res.detail === "User is Inactive or the account has been banned.")
          toast.error(res.detail, {position: toast.POSITION.TOP_CENTER});
      }
    )    
  }

  _handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.handleSubmit()
    }
  }

  handleGuestJoin = () => {
    AuthenticationService.joinAsGuest()
      .then((res) => {return res.json()})
      .then((res) => {
        if(res.access_token!==undefined){
          this.notify("Guest");
          AuthenticationService.setToken(res, "GUEST");
        }
      })

  }

  handleGoogle = (response) => {
    AuthenticationService.googleAuth(response.tokenId)
    .then((res) => {
      if(res.ok)
        return res.json();
    }).then((res)=>{
      if(res.access_token!==undefined){
        this.notify("Auth");
        AuthenticationService.setToken(res, "AUTH");
      }
    })
  }

  handleGoogleFail = (response) =>{
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
              <GridItem xs={12} sm={12} md={5}>
                <Card className={this.props.classes[this.state.cardAnimaton]}>
                  <form className={this.props.classes.form}>
                    <CardHeader style={{ backgroundColor: "#5BC0BE" }} className={this.props.classes.cardHeader}>
                      <h4>Login</h4>
                      <div className={this.props.classes.socialLine}>
                        <GoogleLogin
                          clientId="251817047000-upjua2t776rni76i52grnpmbi2ju1i2c.apps.googleusercontent.com"
                          onSuccess={this.handleGoogle}
                          onFailure={this.handleGoogleFail}
                        />                        
                      </div>
                    </CardHeader>
                    <p className={this.props.classes.divider}>Or Be Classical</p>
                    <CardBody>
                      {this.state.passwSt==="Incorrect email or password" && this.state.emailSt==="Incorrect email or password"?
                        <Typography variant="caption" id="component-error-text" style={{color:"red"}}>Incorrect email or password*</Typography>
                        :
                        <></>
                      }
                      <CustomInput
                        st = {this.state.emailSt}
                        labelText="Email..."
                        id="email"
                        formControlProps={{
                          fullWidth: true
                        }}
                        inputProps={{
                          onKeyDown: this._handleKeyDown,
                          type: "email",
                          endAdornment: (
                            <InputAdornment position="end">
                              <Email className={this.props.classes.inputIconsColor} />
                            </InputAdornment>
                          )
                        }}
                      />
                      <CustomInput
                        st = {this.state.passwSt}
                        labelText="Password"
                        id="pass"
                        formControlProps={{
                          fullWidth: true
                        }}
                        inputProps={{
                          onKeyDown: this._handleKeyDown,
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
                    </CardBody>
                    <CardFooter className={this.props.classes.cardFooter}>
                      <Col>
                        <Row>
                          <Button
                            onClick={this.handleSubmit} 
                            style={{ 
                              backgroundColor: "#5BC0BE", marginLeft: "auto", 
                              marginRight: "auto" 
                            }} 
                            size="md"
                          >
                            Submit
                          </Button>
                        </Row>
                        <br />
                        <Row>
                          <span style={{marginLeft:"auto", marginRight:"auto"}}>OR</span> 
                        </Row>
                        <Row style={{marginLeft: "auto", marginRight: "auto"}}>
                          <Col sm={6} md={6} lg={6}>
                            <Row>
                              <Link to="/register" style={{ marginLeft: "auto", marginRight: "auto" }}>
                                <Button onClick={() => {}}  simple color="primary" size="sm" style={{ marginLeft: "auto", marginRight: "auto" }}>
                                  Register
                                </Button>
                              </Link>
                            </Row>
                          </Col>
                          <Col sm={6} md={6} lg={6}>
                            <Row>
                              <Button onClick={this.handleGuestJoin} style={{ marginLeft: "auto", marginRight: "auto"}} size="sm" simple color="primary"> Join as Guest</Button>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                    </CardFooter>
                  </form>
                </Card>
              </GridItem>
            </GridContainer>
          </div>
        </div>
      </div>

    );
  };
}

export default withStyles(styles)(LoginPage);