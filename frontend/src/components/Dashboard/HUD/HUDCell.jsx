// frontend/src/components/Dashboard/HUD/HUDCell.jsx

import React from 'react';
import {
  GridItem,
  Text,
  Box,
  Tooltip,
  useColorModeValue,
  Icon,
  VStack,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { FaStar, FaLock, FaCrown } from 'react-icons/fa';
import { getStatColor } from '../../../utils/dashboard/statsHelpers';
import { statTooltips } from '../../../constants/dashboard/hudConstants';
import { useCustomColors } from '../../../hooks/dashboard/useCustomColors';

const HUDCell = ({ 
  stat, 
  value, 
  label, 
  onClick, 
  isSelected, 
  tooltip, 
  colorRanges,
  isBlocked = false,
  tieneSuscripcionAvanzada = true
}) => {
  // Colores adaptados al tema oscuro
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  const selectedBg = useColorModeValue("blue.100", "blue.900");
  const selectedBorder = useColorModeValue("blue.400", "blue.400");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const blockedBg = useColorModeValue("gray.200", "gray.900");
  const blockedBorderColor = useColorModeValue("orange.300", "orange.700");
  
  // Hook para colores personalizados
  const { hasCustomColor, getCustomColor } = useCustomColors();
  
  const numValue = parseFloat(value);
  
  // Determinar el color del valor
  let valueColor = useColorModeValue('gray.800', 'white');
  const isCustom = hasCustomColor(stat);
  
  if (!isBlocked) {
    if (isCustom) {
      const customColor = getCustomColor(stat);
      valueColor = customColor || 'white';
    } else if (colorRanges) {
      valueColor = getStatColor(stat, value);
    }
  }

  // Tooltip personalizado para stats bloqueadas
  const tooltipContent = isBlocked ? (
    <VStack align="start" spacing={1}>
      <HStack>
        <Icon as={FaCrown} color="yellow.400" />
        <Text fontWeight="bold">Estadística Premium</Text>
      </HStack>
      <Text fontSize="xs">{tooltip || statTooltips[stat]}</Text>
      <Text fontSize="xs" fontStyle="italic">
        Actualiza a VIP Plata u Oro para desbloquear
      </Text>
    </VStack>
  ) : (
    tooltip || statTooltips[stat] || `${stat}: ${value}`
  );
  
  return (
    <Tooltip 
      label={tooltipContent}
      placement="top"
      hasArrow
      bg={isBlocked ? "orange.800" : "gray.800"}
      color="white"
      fontSize="xs"
      px={3}
      py={2}
    >
      <GridItem
        p={{ base: "4px", md: "6px" }}
        bg={isBlocked ? blockedBg : (isSelected ? selectedBg : bgColor)}
        border="1px solid"
        borderColor={isBlocked ? blockedBorderColor : (isSelected ? selectedBorder : borderColor)}
        cursor={isBlocked ? "not-allowed" : "pointer"}
        onClick={() => !isBlocked && onClick && onClick(stat, value)}
        _hover={!isBlocked ? { 
          bg: isSelected ? selectedBg : hoverBg,
          transform: "scale(1.05)",
          transition: "all 0.2s"
        } : {}}
        textAlign="center"
        position="relative"
        borderRadius="sm"
        transition="all 0.2s"
        boxShadow={isCustom && !isBlocked ? "0 0 0 2px rgba(128, 90, 213, 0.4)" : "none"}
        overflow="hidden"
        opacity={isBlocked ? 0.7 : 1}
      >
        {/* Icono de candado para stats bloqueadas */}
        {isBlocked && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={1}
            opacity={0.5}
          >
            <Icon 
              as={FaLock} 
              color="orange.400"
              boxSize={{ base: "20px", md: "24px" }}
            />
          </Box>
        )}

        {/* Badge VIP más sutil */}
        {isBlocked && (
          <Badge
            position="absolute"
            top="1px"
            right="1px"
            bg="orange.600"
            color="white"
            fontSize="6px"
            px={1}
            py={0}
            borderRadius="sm"
            zIndex={2}
            opacity={0.8}
          >
            VIP
          </Badge>
        )}

        {/* Indicador de stat personalizado */}
        {isCustom && !isBlocked && (
          <Box
            position="absolute"
            top="1px"
            left="1px"
            zIndex={2}
          >
            <Icon 
              as={FaStar} 
              boxSize="8px" 
              color="purple.400"
            />
          </Box>
        )}
        
        {/* Contenido de la celda */}
        <Box position="relative">
          {/* Nombre del stat siempre visible */}
          <Text 
            fontSize={{ base: "8px", md: "9px" }}
            color={isBlocked ? "orange.300" : useColorModeValue('gray.700', 'gray.400')}
            fontWeight="bold"
            lineHeight="1"
            mb="2px"
            letterSpacing="tight"
          >
            {label || stat}
          </Text>
          
          {/* Valor con blur si está bloqueado */}
          <Text 
            fontSize={{ base: "11px", md: "13px" }}
            fontWeight="bold"
            color={isBlocked ? "gray.500" : valueColor}
            lineHeight="1"
            textShadow={isCustom && !isBlocked ? "0 1px 2px rgba(0,0,0,0.3)" : "none"}
            filter={isBlocked ? "blur(4px)" : "none"}
          >
            {isBlocked ? "??%" : value}
          </Text>
        </Box>
        
        {isSelected && !isBlocked && (
          <Box
            position="absolute"
            top="2px"
            right="2px"
            w="4px"
            h="4px"
            bg="green.400"
            borderRadius="full"
            zIndex={3}
          />
        )}
      </GridItem>
    </Tooltip>
  );
};

export default HUDCell;