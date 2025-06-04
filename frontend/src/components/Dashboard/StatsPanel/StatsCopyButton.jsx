// frontend/src/components/Dashboard/StatsPanel/StatsCopyButton.jsx

import React from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaCopyright } from "react-icons/fa";

const StatsCopyButton = ({ selectedStatsCount, copyStats }) => {
  const subtextColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box mt={3} px={{ base: 1, md: 2 }}>
      <HStack justify="space-between" mb={2}>
        <Text fontSize="xs" color={subtextColor}>
          {selectedStatsCount} stats seleccionadas
        </Text>
        <Text fontSize="xs" color={subtextColor}>
          Click para seleccionar • Hover para info
        </Text>
      </HStack>
      
      <Button
        size="sm"
        variant="solid"
        colorScheme="blue"
        leftIcon={<Icon as={FaCopyright} />}
        onClick={copyStats}
        isDisabled={selectedStatsCount === 0}
        width="full"
        _hover={{ transform: "translateY(-1px)" }}
      >
        Copiar Stats Seleccionadas
      </Button>
      
      {/* Leyenda de colores */}
      <Box mt={3} p={2} bg={useColorModeValue("gray.50", "gray.800")} borderRadius="md">
        <Text fontSize="xs" fontWeight="bold" mb={1}>Leyenda de colores:</Text>
        <HStack spacing={3} fontSize="xs" wrap="wrap">
          <HStack spacing={1}>
            <Box w={3} h={3} bg="blue.400" borderRadius="sm" />
            <Text>Tight/Pasivo</Text>
          </HStack>
          <HStack spacing={1}>
            <Box w={3} h={3} bg="green.400" borderRadius="sm" />
            <Text>Balanceado</Text>
          </HStack>
          <HStack spacing={1}>
            <Box w={3} h={3} bg="yellow.400" borderRadius="sm" />
            <Text>Agresivo</Text>
          </HStack>
          <HStack spacing={1}>
            <Box w={3} h={3} bg="orange.400" borderRadius="sm" />
            <Text>Muy Agresivo</Text>
          </HStack>
          <HStack spacing={1}>
            <Box w={3} h={3} bg="red.400" borderRadius="sm" />
            <Text>Extremo</Text>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};

export default StatsCopyButton;