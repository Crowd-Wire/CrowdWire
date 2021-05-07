import React, { useEffect, useState } from 'react';
import AppContext from 'AppContext.js';

// import { createBrowserHistory } from "history";
// var hist = createBrowserHistory(); (not sure if we need this anymore)

import { useRoutes } from 'react-router-dom';
import routes from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAuthStore from 'stores/useAuthStore.ts';
import interceptor from './services/Interceptor';

export default () => {
  
  const guestUser = useAuthStore(state => state.guestUser);
  const registeredUser = useAuthStore(state => state.registeredUser);

  useEffect(() => {
  }, [guestUser,registeredUser]);

  
  const routing = useRoutes(routes(guestUser,registeredUser));
  
  return routing; 
}
