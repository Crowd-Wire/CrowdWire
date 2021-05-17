import React, { useEffect, useState } from 'react';
import { PersistGate } from 'zustand-persist'

// import { createBrowserHistory } from "history";
// var hist = createBrowserHistory(); (not sure if we need this anymore)

import { useRoutes } from 'react-router-dom';
import routes from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAuthStore from 'stores/useAuthStore.ts';
import interceptor from './services/Interceptor';

export default function App(){
  useAuthStore();
  const token = useAuthStore(state => state.token);
  const expire_date = useAuthStore(state => state.expire_date);
  const guest_uuid = useAuthStore(state => state.guest_uuid);
  
  return <PersistGate>
    {useRoutes(routes(token, guest_uuid))}
  </PersistGate>; 
}
