import React from "react";
import ReactDOM from "react-dom";
import App from './App';

import { Provider } from 'react-redux';
import { BrowserRouter as Router } from "react-router-dom";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import store from 'redux/store';

import "assets/scss/material-kit-react.scss?v=1.9.0";
import "assets/scss/global-styles.scss";

ReactDOM.render(
  <Provider store={store}>
    <DndProvider backend={HTML5Backend}>
      <Router>
        <App />
      </Router>
    </DndProvider>
  </Provider>,
  document.getElementById("root")
);



//serviceWorker.unregister();