import React from "react";
import ReactDOM from "react-dom";
import App from './App';

import { Provider } from 'react-redux';
import { BrowserRouter as Router } from "react-router-dom";

import store from 'redux/store';

import "assets/scss/material-kit-react.scss?v=1.9.0";


ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root")
);



//serviceWorker.unregister();