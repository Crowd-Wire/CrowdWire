import React from "react";
import { createBrowserHistory } from "history";
import { Router, Route, Switch } from "react-router-dom";

// pages for this product
import Components from "views/Components/Components.js";
import LandingPage from "views/LandingPage/LandingPage.js";
import ProfilePage from "views/ProfilePage/ProfilePage.js";
import LoginPage from "views/LoginPage/LoginPage.js";
import GamePage from "views/GamePage/GamePage.js";
import Dashboard from "views/Dashboard/Dashboard.js";
import WorldSettings from "views/WorldSettings/WorldSettings.js"
import UserSettings from "views/UserSettings/UserSettings.js"
import MapEditor from "views/MapEditor/MapEditor.js"
import FAQs from "views/FAQs/FAQs.js";
import ContactUs from "views/ContactUs/ContactUs.js";
import AboutUs from "views/AboutUs/AboutUs.js";

var hist = createBrowserHistory();

export default () => (
  <Router history={hist}>
    <Switch>
      <Route path="/app" component={GamePage} />
      <Route path="/landing-page" component={LandingPage} />
      <Route path="/profile-page" component={ProfilePage} />
      <Route path="/login-page" component={LoginPage} />
      <Route path="/dashboard" component={Dashboard}></Route>
      <Route path="/world_settings" component={WorldSettings}></Route>
      <Route path="/user_settings" component={UserSettings}></Route>
      <Route path="/map_editor" component={MapEditor}></Route>
      <Route path="/FAQs" component={FAQs}></Route>
      <Route path="/contact_us" component={ContactUs}></Route>
      <Route path="/about_us" component={AboutUs}></Route>
      <Route path="/" component={Components} />
    </Switch>
  </Router>
);
