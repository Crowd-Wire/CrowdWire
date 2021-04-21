import React from "react";

import { Navigate, Outlet } from 'react-router-dom';

// layouts
import MainLayout from "./layouts/MainLayout";

// pages for this product
import ComponentsPage from "views/ComponentsPage/ComponentsPage.js";
import LandingPage from "views/LandingPage/LandingPage.js";
import ProfilePage from "views/ProfilePage/ProfilePage.js";
import LoginPage from "views/LoginPage/LoginPage.js";
import RegisterPage from "views/RegisterPage/RegisterPage.js";
import GamePage from "views/GamePage/GamePage.js";
import Dashboard from "views/Dashboard/Dashboard.js";
import WorldSettings from "views/WorldSettings/WorldSettings.js"
import UserSettings from "views/UserSettings/UserSettings.js"
import MapEditor from "views/MapEditor/MapEditor.js"
import FAQs from "views/FAQs/FAQs.js";
import ContactUs from "views/ContactUs/ContactUs.js";
import AboutUs from "views/AboutUs/AboutUs.js";
import NotFound from "views/NotFound/NotFound";
import Communications from "views/Communications/Communications";
import CreateWorld from "views/CreateWorld/CreateWorld.js";
import { useNavigate } from 'react-router-dom';

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
            { path: "/contacts", element: <ContactUs /> },
            { path: "/about", element: <AboutUs /> },
            { path: "/FAQs", element: <FAQs /> },
			{ path: "/comms", element: <Communications /> },
			{ path: "/template-components", element: <ComponentsPage /> },
			{ path: "/register", element: <RegisterPage /> },
		],
	},
	{
		path:"/",
		children: [
			{ path: "/create-world", element: <CreateWorld /> },
		],
	},
    { path: "/dashboard", element: <Dashboard /> },
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
