// frontend/src/components/Dashboard/HUD/HUDSection.jsx

import React from 'react';
import {
  GridItem,
  HStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';

const HUDSection = ({ title, children, icon }) => {
  const bgColor = useColorModeValue("gray.700", "gray.800");
  const textColor = useColorModeValue("white", "gray.100"); 
  
  return (
    <>
      <GridItem 
        colSpan={12} 
        bg={bgColor} 
        p={{ base: "3px", md: "4px" }}
        mt={{ base: "2px", md: "3px" }}
      >
        <HStack spacing={1} justify="center">
          {icon && <Icon as={icon} boxSize="12px" color={textColor} />}
          <Text 
            fontWeight="bold" 
            fontSize={{ base: "9px", md: "10px" }}
            color={textColor}
            letterSpacing="wider"
            textTransform="uppercase"
          >
            {title}
          </Text>
        </HStack>
      </GridItem>
      {children}
    </>
  );
};

export default HUDSection;