import React from "react";
import RoomCall from "../../components/Communications/RoomCall";
import backImg from '../../assets/img/bg8.png';


const Communications = () => {

  return (
    <div style={{backgroundImage: `url(${backImg})`, paddingTop: 90, height: '100vh'}}>
      <RoomCall/>
    </div>
  );
}


export default Communications;