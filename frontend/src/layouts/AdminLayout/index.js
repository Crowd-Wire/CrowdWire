import React from "react";

import { Outlet } from 'react-router-dom';

import Header from "components/Header/Header";

const AdminLayout = (props) => {
  const {...rest} = props;
  return (
      <div style={{height:"100%",     backgroundImage: 'linear-gradient(to bottom right, #2B9BFD 4%, #71d1b9 90%)'
}}>
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