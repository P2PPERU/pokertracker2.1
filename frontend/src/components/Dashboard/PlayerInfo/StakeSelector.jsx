// frontend/src/components/Dashboard/PlayerInfo/StakeSelector.jsx

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaLayerGroup } from "react-icons/fa";
import { getStakeColor, getStakeLabel } from '../../../utils/dashboard/statsHelpers';

const StakeSelector = ({ stakesDisponibles, stakeSeleccionado, cambiarStake }) => {
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");

  if (stakesDisponibles.length <= 1) return null;

  return (
    <Box 
      p={3} 
      bg={useColorModeValue("blue.50", "blue.900")}
      borderRadius="md" 
      mb={4}
      position="relative"
      zIndex={1}
    >
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Text fontWeight="bold" color={textColor}>
            Stakes disponibles:
          </Text>
          <Badge colorScheme="blue">
            {stakesDisponibles.length} stakes
          </Badge>
        </HStack>
        
        <HStack spacing={2} wrap="wrap">
          {stakesDisponibles.map((stakeData) => (
            <Button
              key={stakeData.stake}
              size="sm"
              variant={stakeSeleccionado === stakeData.stake ? "solid" : "outline"}
              colorScheme={getStakeColor(stakeData.stake)}
              onClick={() => cambiarStake(stakeData.stake)}
              leftIcon={<Icon as={FaLayerGroup} />}
            >
              {getStakeLabel(stakeData.stake)}
              <Badge ml={2} variant="subtle">
                {stakeData.manos} manos
              </Badge>
            </Button>
          ))}
        </HStack>
        
        {stakeSeleccionado && (
          <Text fontSize="sm" color={subtextColor}>
            Mostrando estadísticas de {getStakeLabel(stakeSeleccionado)}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default StakeSelector;