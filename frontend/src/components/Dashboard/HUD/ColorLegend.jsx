// frontend/src/components/Dashboard/HUD/ColorLegend.jsx

import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  Collapse,
  Button,
  useDisclosure,
  useColorModeValue,
  SimpleGrid,
  Tooltip,
} from '@chakra-ui/react';
import { FaPalette, FaChevronDown, FaChevronUp, FaStar, FaGlobe } from 'react-icons/fa';
import { useCustomColors, PRESET_COLORS } from '../../../hooks/dashboard/useCustomColors';
import { ALL_STATS } from '../../../constants/dashboard/hudConstants';

const ColorLegend = () => {
  const { isOpen, onToggle } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const {
    customStats,
    getCustomColor,
    useGlobalColor,
    globalCustomColor,
  } = useCustomColors();

  // No mostrar si no hay stats personalizados
  if (!customStats || customStats.length === 0) return null;

  // Obtener información de los stats personalizados
  const getStatInfo = (statId) => {
    if (!statId || typeof statId !== 'string') return null;
    
    for (const [section, stats] of Object.entries(ALL_STATS)) {
      const stat = stats.find(s => s.id === statId);
      if (stat) {
        return { ...stat, section };
      }
    }
    return null;
  };

  // Obtener el nombre del color
  const getColorName = (colorValue) => {
    if (!colorValue) return 'Sin color';
    const preset = PRESET_COLORS.find(c => 
      c.value === colorValue || 
      c.value.light === colorValue || 
      c.value.dark === colorValue
    );
    return preset ? preset.name : 'Personalizado';
  };

  // Filtrar solo stats válidos
  const validCustomStats = customStats.filter(statId => {
    const statInfo = getStatInfo(statId);
    return statInfo !== null;
  });

  // Si no hay stats válidos, no mostrar nada
  if (validCustomStats.length === 0) return null;

  return (
    <Box 
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      p={3}
      mb={4}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        rightIcon={<Icon as={isOpen ? FaChevronUp : FaChevronDown} />}
        leftIcon={<Icon as={FaPalette} color="purple.500" />}
        w="full"
        justifyContent="space-between"
      >
        <HStack>
          <Text fontWeight="bold">Colores Personalizados</Text>
          <Badge colorScheme="purple" borderRadius="full">
            {validCustomStats.length}
          </Badge>
        </HStack>
      </Button>

      <Collapse in={isOpen} animateOpacity>
        <VStack spacing={3} mt={3} align="stretch">
          
          {/* Información del color global */}
          {useGlobalColor && globalCustomColor && (
            <Box 
              p={2} 
              bg={useColorModeValue('purple.50', 'purple.900')}
              borderRadius="md"
              border="1px solid"
              borderColor="purple.200"
            >
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FaGlobe} color="purple.500" />
                  <Text fontSize="sm" fontWeight="bold">
                    Color Global Activo
                  </Text>
                </HStack>
                <HStack>
                  <Box
                    w={4}
                    h={4}
                    bg={globalCustomColor}
                    borderRadius="sm"
                    border="1px solid"
                    borderColor="gray.300"
                  />
                  <Text fontSize="sm">
                    {getColorName(globalCustomColor)}
                  </Text>
                </HStack>
              </HStack>
              <Text fontSize="xs" color="gray.600" mt={1}>
                Aplicado a todos los stats marcados
              </Text>
            </Box>
          )}

          {/* Lista de stats personalizados */}
          <SimpleGrid columns={2} spacing={2}>
            {validCustomStats.map((statId, index) => {
              const statInfo = getStatInfo(statId);
              const customColor = getCustomColor(statId);
              
              if (!statInfo) return null;
              
              // Usar una key única combinando statId con index para evitar duplicados
              const uniqueKey = `${statId}-${index}-${Date.now()}`;
              
              return (
                <Tooltip
                  key={uniqueKey}
                  label={`${statInfo.section.toUpperCase()} • ${statInfo.tooltip || 'Sin descripción'}`}
                  fontSize="xs"
                >
                  <Box
                    p={2}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderRadius="sm"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <HStack justify="space-between" spacing={2}>
                      <HStack spacing={1} flex="1" minW="0">
                        <Icon as={FaStar} boxSize={3} color="purple.400" />
                        <Text fontSize="xs" fontWeight="bold" isTruncated>
                          {statInfo.label}
                        </Text>
                      </HStack>
                      
                      <HStack spacing={1}>
                        <Box
                          w={3}
                          h={3}
                          bg={customColor || 'gray.400'}
                          borderRadius="sm"
                          border="1px solid"
                          borderColor="gray.300"
                        />
                        {!useGlobalColor && customColor && (
                          <Text fontSize="xs" color="gray.600">
                            {getColorName(customColor)}
                          </Text>
                        )}
                      </HStack>
                    </HStack>
                  </Box>
                </Tooltip>
              );
            })}
          </SimpleGrid>

          {/* Leyenda de colores disponibles */}
          <Box 
            p={2}
            bg={useColorModeValue('blue.50', 'blue.900')}
            borderRadius="md"
          >
            <Text fontSize="xs" fontWeight="bold" mb={2}>
              💡 Colores Disponibles:
            </Text>
            <HStack spacing={1} wrap="wrap">
              {PRESET_COLORS.slice(0, 8).map(color => (
                <Tooltip key={color.name} label={color.name}>
                  <Box
                    w={3}
                    h={3}
                    bg={color.value.light}
                    borderRadius="sm"
                    border="1px solid"
                    borderColor="gray.300"
                    cursor="help"
                  />
                </Tooltip>
              ))}
              <Text fontSize="xs" color="gray.500">
                +{PRESET_COLORS.length - 8} más
              </Text>
            </HStack>
          </Box>
        </VStack>
      </Collapse>
    </Box>
  );
};

export default ColorLegend;