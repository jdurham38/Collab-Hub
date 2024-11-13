import React from 'react';
import Typewriter from 'typewriter-effect';

interface TypewriterComponentProps {
  text: string;
}

const TypewriterComponent: React.FC<TypewriterComponentProps> = ({ text }) => {
  return (
    <Typewriter
      onInit={(typewriter) => {
        typewriter
          .typeString(text || 'Create a New Project') // Fallback text if text is empty
          .pauseFor(1000)
          .start();
      }}
      options={{
        autoStart: true,
        loop: false,
        delay: 50,
      }}
      key={text} // Re-render the component when text changes
    />
  );
};

export default TypewriterComponent;
