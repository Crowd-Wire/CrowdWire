/************************************
1. If you want to add or remove items you will need to change a variable called $slide-count in the CSS *minimum 3 slides

2. if you want to change the dimensions of the slides you will need to edit the slideWidth variable here 👇 and the $slide-width variable in the CSS.
************************************/
import React, { useState } from 'react';
import Carousel from "react-grid-carousel";
import styled from 'styled-components';

const randomImageUrl = 'https://picsum.photos/800/600?random='

const Item = styled.div`
  background-image: ${({ img }) => `url(${img})`};
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
  height: 200px;
`

const AvatarCarousel = () => {
    const [cols, setCols] = useState(1)
    const [rows, setRows] = useState(1)
    const [gap, setGap] = useState(10)
    const [pages, setPages] = useState(3)

    return (
      <Carousel cols={cols} rows={rows} gap={gap}>
        {[...Array(cols * rows * pages)].map((_, i) => (
          <Carousel.Item key={i}>
            <Item img={randomImageUrl + i} />
          </Carousel.Item>
        ))}
      </Carousel>
    );
};

export default AvatarCarousel;