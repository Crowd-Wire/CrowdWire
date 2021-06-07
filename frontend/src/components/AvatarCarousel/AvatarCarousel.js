/************************************
1. If you want to add or remove items you will need to change a variable called $slide-count in the CSS *minimum 3 slides

2. if you want to change the dimensions of the slides you will need to edit the slideWidth variable here 👇 and the $slide-width variable in the CSS.
************************************/
import React from 'react';
import { API_BASE } from "config";


const AvatarCarousel = ({ avatar }) => {
    return (
        <img key={avatar} src={API_BASE + "static/characters/" + avatar + '.png'} style={{width: 130}}/>
    );
};

export default AvatarCarousel;