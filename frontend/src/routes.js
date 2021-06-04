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
import WorldEditorPage from "views/WorldEditorPage/WorldEditorPage.js";
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
import AdminWorldDetails from "views/AdminWorldDetails/AdminWorldDetails.js";
import AdminUserReports from 'views/AdminUserReports/AdminUserReports.js';
import AdminUserDetails from "views/AdminUserDetails/AdminUserDetails";
import AdminUsers from "views/AdminUsers/AdminUsers";

/**
 * Public and protected routes list 
 * Based on https://stackoverflow.com/questions/62384395/protected-route-with-react-router-v6
 * 
 * Outlet as element is the same as no layout
 * 
 * @param       isAuth       a boolean to check if the user is authorized
 */
const routes = (token, guest_uuid, last_location,is_superuser) => [
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
		element: token ? <Navigate to={last_location ? last_location : "/dashboard/search/public"}/> : <Outlet/>,
		children: [
            { path: "/login", element: <LoginPage/> },
			{ path: "/register", element: <RegisterPage/> },
		],
	},
	{
		path:"/create-world",
		element:  token ? <CreateWorld /> : <Navigate to="/login"/>,
	},
	{
		path:"/join",
		element:  <InviteJoinPage />,
	},	
	{ 
		path: "/dashboard", 
		element: token  ? <DrawerLayout/> : <Navigate to="/login"/>,
		children: [
			{path: "/:id", element: <DashboardContent/>},
			{path:"/search/:type", element: <SearchAllMaps/>},
			{path: "/user", element: <UserSettings /> },
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
            { path: "/:id/editor", element: <WorldEditorPage /> },
		],
	},
	{
		path: "/admin",
		element: is_superuser ? <AdminLayout /> : <Navigate to={"/dashboard/search/joined"}/>,
		children: [
            { path: "/worlds/reports", element: <AdminWorldReports /> },
			{ path: "/worlds", element: <AdminWorlds />},
			{ path: "/worlds/:id", element: <AdminWorldDetails/>},
			{ path: "/statistics", element: <AdminStatistics/>},
			{ path: "/users", element: <AdminUsers/>},
			{ path: "/users/reports", element: <AdminUserReports/>},
			{ path: "/users/:id", element: <AdminUserDetails/>}
		],
	},
    { path: "*", element: <NotFound /> },
];

export default routes;
