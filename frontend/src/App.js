import React from "react";

// import { createBrowserHistory } from "history";
// var hist = createBrowserHistory(); (not sure if we need this anymore)

import { useRoutes } from 'react-router-dom';
import routes from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';

export default () => {
  const changeAuth = (auth) => {
    setAuth(auth);
  }
  const [isAuth, setAuth] = React.useState(false);
  const routing = useRoutes(routes(isAuth, changeAuth));
  
  return routing;
}
