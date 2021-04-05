import React from "react";
import ReactDOM from "react-dom";
import App from './App';

import { Provider } from 'react-redux';

import store from 'redux/store';

import "assets/scss/material-kit-react.scss?v=1.9.0";
import 'assets/scss/global-styles.scss';


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);



//serviceWorker.unregister();