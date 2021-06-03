import React from "react";

import { Outlet } from 'react-router-dom';

import Header from "components/Header/Header";

const AdminLayout = (props) => {
  const {...rest} = props;
  return (
      <div style={{height:"100%"}}>
          <Header
            absolute
            color="transparent"
            brand=""
            size="sm"
            {...rest}
          />
          <Outlet />
      </div>
  );
}

export default AdminLayout;