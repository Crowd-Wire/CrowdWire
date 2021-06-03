import React from "react";
import { useNavigate, useParams } from "react-router-dom";

export const withRouter = (Component) => {
    const Wrapper = (props) => {
      const params = useParams();
      const navigate = useNavigate();

      return (
        <Component
            params={params}
            navigate={navigate}
          {...props}
          />
      );
    };
    
    return Wrapper;
};
