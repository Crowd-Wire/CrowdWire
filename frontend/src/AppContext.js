
import React from "react";

const AppContext = React.createContext({ isAuth: null, changeAuth: (auth) =>{}});

export default AppContext;