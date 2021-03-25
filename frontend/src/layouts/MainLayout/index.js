import React from "react";

import { Outlet } from 'react-router-dom';

import Header from "components/Header/Header";
import HeaderLinks from "components/Header/HeaderLinks";

const MainLayout = (props) => {
  const {...rest} = props;
  const dashboardRoutes = [];
  return (
      <div>
          <Header
            color="transparent"
            routes={dashboardRoutes}
            brand="Material Kit React"
            rightLinks={<HeaderLinks />}
            fixed
            changeColorOnScroll={{
              height: 400,
              color: "white"
            }}
            {...rest}
          />

          {/* renders each page components 
          (it can be interpreted as the children) */}
          <Outlet />
      </div>
  );
}

export default MainLayout;