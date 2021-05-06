import React from "react";

// import { createBrowserHistory } from "history";
// var hist = createBrowserHistory(); (not sure if we need this anymore)

import { useRoutes } from 'react-router-dom';
import routes from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAuthStore from 'stores/useAuthStore.ts';
export default () => {
  const changeAuth = (auth) => {
    setAuth(auth);
  }
  const startAuth = () => {
    const st = useAuthStore.getState();
    if(st.registeredUser && st.registeredUser.token)
      return "REGISTERED";
    else if(st.guestUser && st.guestUser.token)
      return "GUEST"
    return null;
  }
  const [isAuth, setAuth] = React.useState(startAuth());
  const routing = useRoutes(routes(isAuth, changeAuth));
  
  return routing;
}
