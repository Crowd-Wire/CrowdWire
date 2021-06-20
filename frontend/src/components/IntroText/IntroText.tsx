import React from 'react';
import ReactTypingEffect from 'react-typing-effect';

const IntroText = () => {
  return (
    <>
      <ReactTypingEffect
        speed={100}
        eraseSpeed={100}
        typingDelay={700}
        text={["Hello!", "Welcome to CrowdWire!"]}
        cursorRenderer={cursor => <h1>{cursor}</h1>}
        displayTextRenderer={(text, i) => {
          return (
            <h1>
              {text.split('').map((char, i) => {
                const key = `${i}`;
                return (
                  <span
                    key={key}
                    style={[0,1,2,3,4,5,6,7,8,9].indexOf(i) !== -1 ? { color: 'black', fontWeight: 300} : {color: 'white', fontWeight: 600}}
                  >{char}</span>
                );
              })}
            </h1>
          );
        }}        
      />
    </>
  );
};
export default IntroText;