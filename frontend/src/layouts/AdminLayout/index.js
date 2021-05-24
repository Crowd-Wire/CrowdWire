import React from "react";

import { Outlet } from 'react-router-dom';

import Header from "components/Header/Header";

const AdminLayout = (props) => {
  const {...rest} = props;
  return (
      <div>
          <Header
            absolute
            color="transparent"
            brand=""
            size="sm"
            // rightLinks={<HeaderLinks />}
            {...rest}
          />
          <Outlet />
      </div>
  );
}

export default AdminLayout;