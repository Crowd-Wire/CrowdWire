import React from "react";

// import { createBrowserHistory } from "history";
// var hist = createBrowserHistory(); (not sure if we need this anymore)

import { useRoutes } from 'react-router-dom';
import routes from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import interceptor from './services/Interceptor';

export default () => {
  const changeAuth = (auth) => {
    setAuth(auth);
  }
  const startAuth = () => {
    if(localStorage.getItem("auth") && localStorage.getItem("auth")["token"]!==null)
      return true;
    return false;
  }
  const [isAuth, setAuth] = React.useState(startAuth());
  const routing = useRoutes(routes(isAuth, changeAuth));
  
  return routing;
}
