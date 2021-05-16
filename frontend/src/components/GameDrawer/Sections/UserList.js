import React, {useState} from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

import style from "assets/jss/my-kit-react/components/GameDrawer/userListStyle.js";
import exampleStyle from 'assets/jss/material-kit-react/views/componentsSections/exampleStyle';


const example = [
  {name: "TONI", request: true},
  {name: "TOZE", request: false},
  {name: "Tono Tono", request: false},
  {name: "Tino Tino", request: true},
  {name: "Tina", request: false},
]

const UserList = (props) => {
    const {classes} = props;
    const [users, setUsers] = React.useState(example);

    return (
        <div className={classes.root}>
        {
          users.map((u) => (
            <div className={classes.user}>
                <div className={classes.avatar}></div>
                <div className={classes.content}>
                  <div className={classes.username}>{u.name}</div>
                  { 
                    u.request && 
                      <div className={classes.request}>
                        Requested to speak
                        <div className={classes.requestButtons}>
                          <Button color="primary" variant="contained" style={{height: "1.125rem", fontSize: "0.8rem", marginRight: "1rem"}}>
                            Accept
                          </Button>
                          <Button color="secondary" variant="contained" style={{height: "1.125rem", fontSize: "0.8rem"}}>
                            Reject
                          </Button>
                        </div>
                      </div>
                  }
                </div>
            </div>
          ))
        }
        </div>
    );
}

export default withStyles(style)(UserList);


// import { withStyles } from "@material-ui/core/styles";
// import Button from "@material-ui/core/Button";
// import React from "react";
// import ArrowBack from "@material-ui/icons/ArrowBack";

// const styles = (theme) => ({
//   button: {
//     backgroundColor: "red",
//     "&:hover": {
//       backgroundColor: "blue"
//     },
//     position: "absolute",
//     bottom: 20,
//     right: 20
//   }
// });

// class APIWidget extends React.Component {
//   render() {
//     return (
//       <Button
//         variant="contained"
//         color="secondary"
//         className={this.props.classes.button}
//         startIcon={<ArrowBack />}
//       >
//         Back
//       </Button>
//     );
//   }
// }
// export default withStyles(styles)(APIWidget);
