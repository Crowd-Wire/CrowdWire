/************************************
1. If you want to add or remove items you will need to change a variable called $slide-count in the CSS *minimum 3 slides

2. if you want to change the dimensions of the slides you will need to edit the slideWidth variable here 👇 and the $slide-width variable in the CSS.
************************************/
import React, { useState } from 'react';
import Carousel from "react-grid-carousel";
import styled from 'styled-components';


const Item = styled.div`
  background-image: ${({ img }) => `url(${img})`};
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
  height: 200px;
`

const AvatarCarousel = ({avatar="https://picsum.photos/800/600?random=0"}) => {
    console.log(avatar)
    return (
      <Carousel cols={1} rows={1} gap={10}>
        <Carousel.Item key={avatar}>
          <Item img={avatar}/>
        </Carousel.Item>
      </Carousel>
    );
};

export default AvatarCarousel;