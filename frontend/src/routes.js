import React, { useContext } from "react";

import { Navigate, Outlet } from 'react-router-dom';

// layouts
import MainLayout from "./layouts/MainLayout";
import DrawerLayout from "layouts/DrawerLayout";
import AdminLayout from "layouts/AdminLayout";

// pages for this product
import ComponentsPage from "views/ComponentsPage/ComponentsPage.js";
import LandingPage from "views/LandingPage/LandingPage.js";
import ProfilePage from "views/ProfilePage/ProfilePage.js";
import LoginPage from "views/LoginPage/LoginPage.js";
import RegisterPage from "views/RegisterPage/RegisterPage.js";
import GamePage from "views/GamePage/GamePage.js";
import WorldSettings from "views/WorldSettings/WorldSettings.js"
import UserSettings from "views/UserSettings/UserSettings.js"
import MapEditor from "views/MapEditor/MapEditor.js";
import FAQs from "views/FAQs/FAQs.js";
import ContactUs from "views/ContactUs/ContactUs.js";
import AboutUs from "views/AboutUs/AboutUs.js";
import NotFound from "views/NotFound/NotFound";
import Communications from "views/Communications/Communications";
import CreateWorld from "views/CreateWorld/CreateWorld.js";
import InviteJoinPage from "views/InvitePage/InviteJoinPage.js";
import DashboardContent from "views/DashWorldDetails/sections/DashboardContent.js";
import SearchAllMaps from "views/DashSearch/sections/SearchAllMaps.js";
import AdminWorldReports from 'views/AdminWorldReports/AdminWorldReports.js';
import AdminWorlds from "views/AdminWorlds/AdminWorlds.js";
import AdminStatistics from 'views/AdminStatistics/AdminStatistics.js'

/**
 * Public and protected routes list 
 * Based on https://stackoverflow.com/questions/62384395/protected-route-with-react-router-v6
 * 
 * Outlet as element is the same as no layout
 * 
 * @param       isAuth       a boolean to check if the user is authorized
 */
 
const routes = (token, guest_uuid) => [
	{
		path: "/",
		element: <MainLayout />,
		children: [
            { path: "/", element: <LandingPage /> },
            { path: "/contacts", element: <ContactUs /> },
            { path: "/about", element: <AboutUs /> },
            { path: "/FAQs", element: <FAQs /> },
			{ path: "/comms", element: <Communications /> },
			{ path: "/template-components", element: <ComponentsPage /> },
		],
	},
	{
		path: "/",
		element: token ? <Navigate to="/dashboard/search/public"/> : <Outlet/>,
		children: [
            { path: "/login", element: <LoginPage/> },
			{ path: "/register", element: <RegisterPage/> },
		],
	},
	{
		path:"/",
		element:  token ? <Outlet/> : <Navigate to="/login"/>,
		children: [
			{ path: "/create-world", element: <CreateWorld/> },
			{ path: "/join", element: <InviteJoinPage/>},
		],
	},
	{ 
		path: "/dashboard", 
		element: token  ? <DrawerLayout/> : <Navigate to="/login"/>,
		children: [
			{path: "/:id", element: <DashboardContent/>},
			{path:"/search/:type", element: <SearchAllMaps/>}		
		]
	},
    {
		path: "/user",
		element: token ? <Outlet /> : <Navigate to="/login" />,
		children: [
            { path: "/profile", element: !guest_uuid ? <ProfilePage /> : <Navigate to="/login"/> },
            { path: "/settings", element: <UserSettings /> },
		],
	},
    {
		path: "/world",
		element: token ? <Outlet /> : <Navigate to="/login" />,
		children: [
            { path: "/:id", element: <GamePage /> },
			{ path: "/:id/settings", element: <WorldSettings /> },
            { path: "/:id/editor", element: <MapEditor /> },
		],
	},
	{
		path: "/admin",
		element: token ? <AdminLayout /> : <Navigate to="/login" />,
		children: [
            { path: "/worlds/reports", element: <AdminWorldReports /> },
			      { path: "/worlds", element: <AdminWorlds />},
			      { path: "/statistics", element: <AdminStatistics/>}
		],
	},
    { path: "*", element: <NotFound /> },
];

export default routes;
