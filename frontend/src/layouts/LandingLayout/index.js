import React from "react";

import { useNavigate } from "react-router-dom";
import { Outlet } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Header from "components/Header/Header";


const MainLayout = (props) => {
  const navigate = useNavigate();
  const {...rest} = props;
  return (
      <div>
          {/* <Header
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
          /> */}
          <Header
            absolute
            color="transparent"
            brand=""
            size="sm"
            rightLinks={  <><Button variant="outline-success" size="lg" style={{marginRight:"10px"}} onClick={()=>navigate("/login")}> Login </Button><Button variant="outline-info" size="lg" onClick={()=>navigate("/register")}>Register</Button></>}
            {...rest}
          />
          {/* renders each page components 
          (it can be interpreted as the children) */}
          <Outlet />
      </div>
  );
}

export default MainLayout;