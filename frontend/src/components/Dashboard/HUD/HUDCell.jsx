// frontend/src/components/Dashboard/HUD/HUDCell.jsx

import React from 'react';
import {
  GridItem,
  Text,
  Box,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { getStatColor } from '../../../utils/dashboard/statsHelpers';
import { statTooltips } from '../../../constants/dashboard/hudConstants';

const HUDCell = ({ stat, value, label, onClick, isSelected, tooltip, colorRanges }) => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const selectedBg = useColorModeValue("blue.100", "blue.900");
  const selectedBorder = useColorModeValue("blue.400", "blue.400");
  const hoverBg = useColorModeValue("gray.100", "gray.800");
  
  const numValue = parseFloat(value);
  const valueColor = colorRanges ? getStatColor(stat, value) : 'white';
  
  return (
    <Tooltip 
      label={tooltip || statTooltips[stat] || `${stat}: ${value}`}
      placement="top"
      hasArrow
      bg="gray.800"
      color="white"
      fontSize="xs"
      px={3}
      py={2}
    >
      <GridItem
        p={{ base: "4px", md: "6px" }}
        bg={isSelected ? selectedBg : bgColor}
        border="1px solid"
        borderColor={isSelected ? selectedBorder : borderColor}
        cursor="pointer"
        onClick={() => onClick && onClick(stat, value)}
        _hover={{ 
          bg: isSelected ? selectedBg : hoverBg,
          transform: "scale(1.05)",
          transition: "all 0.2s"
        }}
        textAlign="center"
        position="relative"
        borderRadius="sm"
        transition="all 0.2s"
      >
        <Text 
          fontSize={{ base: "8px", md: "9px" }}
          color="gray.500" 
          fontWeight="bold"
          lineHeight="1"
          mb="2px"
          letterSpacing="tight"
        >
          {label || stat}
        </Text>
        <Text 
          fontSize={{ base: "11px", md: "13px" }}
          fontWeight="bold"
          color={valueColor}
          lineHeight="1"
        >
          {value}
        </Text>
        {isSelected && (
          <Box
            position="absolute"
            top="2px"
            right="2px"
            w="4px"
            h="4px"
            bg="green.400"
            borderRadius="full"
          />
        )}
      </GridItem>
    </Tooltip>
  );
};

export default HUDCell;