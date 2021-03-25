import React from "react";

// import { createBrowserHistory } from "history";
// var hist = createBrowserHistory(); (not sure if we need this anymore)

import { useRoutes } from 'react-router-dom';
import routes from './routes';


export default () => {
  const isAuth = true;
  const routing = useRoutes(routes(isAuth));

  return routing;
}