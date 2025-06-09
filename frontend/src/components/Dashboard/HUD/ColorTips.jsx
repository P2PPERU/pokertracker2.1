// frontend/src/components/Dashboard/HUD/ColorTips.jsx

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Badge,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';
import {
  FaLightbulb,
  FaHandPaper,
  FaChartPie,
  FaTrophy,
  FaPalette,
  FaGlobe,
  FaStar,
  FaEye,
} from 'react-icons/fa';

const ColorTips = () => {
  const cardBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.200', 'blue.700');
  const iconColor = useColorModeValue('blue.600', 'blue.300');

  const colorStrategies = [
    {
      title: "Por Categoría",
      icon: FaChartPie,
      color: "blue",
      tips: [
        "🔴 Rojo: Stats preflop agresivos (VPIP, PFR, 3Bet)",
        "🔵 Azul: Stats postflop (CBet, WTSD, WSD)", 
        "🟢 Verde: Stats de showdown y river",
        "🟡 Amarillo: Stats especiales (Limp, Squeeze)"
      ]
    },
    {
      title: "Por Importancia",
      icon: FaStar,
      color: "purple",
      tips: [
        "🔴 Rojo: Stats más importantes",
        "🟠 Naranja: Stats importantes",
        "🟡 Amarillo: Stats moderados",
        "🔵 Azul: Stats de referencia"
      ]
    },
    {
      title: "Por Tipo de Jugador",
      icon: FaHandPaper,
      color: "green",
      tips: [
        "🔴 Tight: VPIP, PFR, Fold to 3Bet",
        "🟠 Loose: VPIP alto, Limp%, WTSD",
        "🔵 Agresivo: 3Bet, CBet, Bet River",
        "🟢 Pasivo: Fold stats, Call stats"
      ]
    }
  ];

  const quickTips = [
    {
      icon: FaGlobe,
      title: "Color Global",
      description: "Usa un solo color para todos tus stats importantes"
    },
    {
      icon: FaEye,
      title: "Identificación Rápida",
      description: "Los stats personalizados tienen una ⭐ y borde especial"
    },
    {
      icon: FaPalette,
      title: "12 Colores",
      description: "Tenés una amplia paleta de colores para elegir"
    },
    {
      icon: FaTrophy,
      title: "Solo Premium",
      description: "Funcionalidad exclusiva para usuarios Plata y Oro"
    }
  ];

  return (
    <Box
      p={4}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      mb={4}
    >
      <VStack align="stretch" spacing={4}>
        
        {/* Header */}
        <HStack>
          <Icon as={FaLightbulb} color={iconColor} boxSize={5} />
          <Text fontSize="md" fontWeight="bold">
            💡 Estrategias de Colorización
          </Text>
        </HStack>

        <Text fontSize="sm" color="gray.600">
          Aquí tienes algunas estrategias probadas para organizar tus estadísticas por colores:
        </Text>

        {/* Estrategias principales */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
          {colorStrategies.map((strategy, index) => (
            <Box
              key={index}
              p={3}
              bg={useColorModeValue('white', 'gray.800')}
              borderRadius="md"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.600')}
            >
              <HStack mb={3}>
                <Icon as={strategy.icon} color={`${strategy.color}.500`} />
                <Text fontSize="sm" fontWeight="bold">
                  {strategy.title}
                </Text>
              </HStack>
              
              <VStack align="start" spacing={1}>
                {strategy.tips.map((tip, tipIndex) => (
                  <Text key={tipIndex} fontSize="xs" color="gray.600">
                    {tip}
                  </Text>
                ))}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        <Divider />

        {/* Tips rápidos */}
        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={3}>
            🚀 Tips Rápidos
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {quickTips.map((tip, index) => (
              <HStack key={index} spacing={3}>
                <Icon as={tip.icon} color={iconColor} boxSize={4} />
                <Box>
                  <Text fontSize="sm" fontWeight="semibold">
                    {tip.title}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {tip.description}
                  </Text>
                </Box>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>

        {/* Ejemplo práctico */}
        <Box
          p={3}
          bg={useColorModeValue('yellow.50', 'yellow.900')}
          borderRadius="md"
          border="1px solid"
          borderColor={useColorModeValue('yellow.200', 'yellow.700')}
        >
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            📋 Ejemplo Práctico: Setup para Cash Game
          </Text>
          
          <VStack align="start" spacing={1} fontSize="xs">
            <Text>• <Badge colorScheme="red" mr={1}>ROJO</Badge> VPIP, PFR (lectura básica del jugador)</Text>
            <Text>• <Badge colorScheme="blue" mr={1}>AZUL</Badge> 3Bet, F3B (agresión preflop)</Text>
            <Text>• <Badge colorScheme="green" mr={1}>VERDE</Badge> CBet, FCB (postflop)</Text>
            <Text>• <Badge colorScheme="purple" mr={1}>MORADO</Badge> WTSD, WSD (showdown)</Text>
          </VStack>
        </Box>

      </VStack>
    </Box>
  );
};

export default ColorTips;