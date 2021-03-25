import React from "react";

import { Navigate,Outlet } from 'react-router-dom';

// layouts
import MainLayout from "./layouts/MainLayout";

// pages for this product
import ComponentsPage from "views/ComponentsPage/ComponentsPage.js";
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
import NotFound from "views/NotFound/NotFound";

/**
 * @author Leandro Silva
 * 
 * Public and protected routes list 
 * Based on https://stackoverflow.com/questions/62384395/protected-route-with-react-router-v6
 * 
 * Outlet as element is the same as no layout
 * 
 * @param       isAuth       a boolean to check if the user is authorized
 */
const routes = (isAuth) => [
	{
		path: "/",
		element: <MainLayout />,
		children: [
            { path: "/", element: <LandingPage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/dashboard", element: <Dashboard /> },
            { path: "/contacts", element: <ContactUs /> },
            { path: "/about", element: <AboutUs /> },
            { path: "/FAQs", element: <FAQs /> },

            { path: "/template-components", element: <ComponentsPage /> },
		],
	},
    {
		path: "/user",
		element: isAuth ? <Outlet /> : <Navigate to="/login" />,
		children: [
            { path: "/profile", element: <ProfilePage /> },
            { path: "/settings", element: <UserSettings /> },
		],
	},
    {
		path: "/world",
		element: isAuth ? <Outlet /> : <Navigate to="/login" />,
		children: [
            { path: "/:id", element: <GamePage /> },
			{ path: "/:id/settings", element: <WorldSettings /> },
            { path: "/:id/editor", element: <MapEditor /> },
		],
	},
    { path: "*", element: <NotFound /> },
];

export default routes;
