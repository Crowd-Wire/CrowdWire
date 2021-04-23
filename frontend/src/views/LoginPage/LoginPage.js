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
import Footer from "components/Footer/Footer.js";
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
    this.setState({cardAnimaton:""})},700

  );

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
        console.log(res);
        localStorage.setItem("auth",JSON.stringify(
          {"token":res.access_token,
            "expire_date":res.expire_date}
          ));
        if(res.access_token!==undefined)
          this.setState({loggedIn:true})
        else if(res.detail==="Invalid email or password.")
          this.setState({passwSt: res.detail,emailSt: res.detail});
        else if(res.detail instanceof Object && res.detail.length===1 & res.detail[0].loc[1]==="username")
          this.setState({passwSt:"", emailSt:"Email Required"});
        else if(res.detail instanceof Object && res.detail.length===1 & res.detail[0].loc[1]==="password")
          this.setState({passwSt:"Password Required", emailSt:""});
        else if(res.detail instanceof Object && res.detail.length===2 & res.detail[0].loc[1]==="username" && res.detail[1].loc[1]==="password")
          this.setState({passwSt:"Password Required", emailSt:"Email Required"});
      }
    )    
  }

  render() {
    if (this.state.loggedIn) {
      return <Navigate to="../dashboard" />
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
                      <h4>Login</h4>
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
                          <Link to="/register" style={{ marginLeft: "auto", marginRight: "auto" }}>
                            <Button onClick={() => {}}  simple color="primary" size="md">
                              Register
                            </Button>
                          </Link>
                        </Row>
                      </Col>
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
  };
}

export default withStyles(styles)(LoginPage);