import React from 'react';
import {
  Box,
  Text,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  format = 'number',
  icon,
  invertColors = false 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const formatValue = (val, type) => {
    switch (type) {
      case 'currency':
        return `$${parseFloat(val).toFixed(2)}`;
      case 'percentage':
        return `${parseFloat(val).toFixed(1)}%`;
      default:
        return Math.round(parseFloat(val));
    }
  };

  const isPositive = parseFloat(change) > 0;
  const changeColor = invertColors 
    ? (isPositive ? 'red.500' : 'green.500')
    : (isPositive ? 'green.500' : 'red.500');

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="flex-start" mb={4}>
        <Box>
          <Text fontSize="sm" color="gray.500" mb={1}>
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {formatValue(value, format)}
          </Text>
        </Box>
        <Text fontSize="2xl">{icon}</Text>
      </Flex>
      
      <Flex align="center">
        <Icon 
          as={isPositive ? FaArrowUp : FaArrowDown} 
          color={changeColor}
          boxSize={3}
          mr={1}
        />
        <Text fontSize="sm" color={changeColor} fontWeight="medium">
          {Math.abs(parseFloat(change)).toFixed(1)}%
        </Text>
        <Text fontSize="sm" color="gray.500" ml={1}>
          vs mes anterior
        </Text>
      </Flex>
    </Box>
  );
};

export default MetricCard;