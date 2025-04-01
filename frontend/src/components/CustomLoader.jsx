// src/components/CustomLoader.jsx
import React from 'react';
import { Flex, Image } from '@chakra-ui/react';

const CustomLoader = () => {
  return (
    <Flex
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      bg="white"
      align="center"
      justify="center"
      zIndex="9999"
    >
      <Image
        src="/images/pokerprotrack_logo.png"
        alt="PokerProTrack Logo"
        boxSize="150px"
      />
    </Flex>
  );
};

export default CustomLoader;
