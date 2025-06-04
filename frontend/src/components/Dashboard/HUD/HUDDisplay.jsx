// frontend/src/components/Dashboard/HUD/HUDDisplay.jsx

import React from 'react';
import {
  Box,
  Grid,
  HStack,
  Text,
  Badge,
  Icon,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaChartLine,
  FaCog,
  FaHandPaper,
  FaChartPie,
  FaWater,
  FaSyncAlt,
  FaTrophy,
  FaMedal,
} from "react-icons/fa";
import HUDCell from './HUDCell';
import HUDSection from './HUDSection';
import { formatStatValue, getStakeColor, getStakeLabel } from '../../../utils/dashboard/statsHelpers';
import { statRanges } from '../../../constants/dashboard/hudConstants';

const HUDDisplay = ({
  jugador,
  stakeSeleccionado,
  getVisibleOrderedStats,
  toggleStatSelection,
  selectedStats,
  onConfigOpen,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const hudBg = useColorModeValue("gray.100", "gray.900");

  const sections = {
    preflop: { title: "PREFLOP", icon: FaHandPaper },
    postflop: { title: "POSTFLOP", icon: FaChartPie },
    flop: { title: "FLOP", icon: FaWater },
    turn: { title: "TURN", icon: FaSyncAlt },
    river: { title: "RIVER", icon: FaTrophy },
    showdown: { title: "SHOWDOWN ADVANCED", icon: FaMedal }
  };

  return (
    <Box 
      p={{ base: 2, md: 3 }}
      bg={cardBg} 
      borderRadius="md" 
      boxShadow="base"
      fontSize="xs"
    >
      {/* Header del HUD con botón de configuración */}
      <HStack mb={2} justify="space-between" px={{ base: 1, md: 2 }}>
        <HStack spacing={2}>
          <Icon as={FaChartLine} color="#4066ED" />
          <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>
            HUD STATISTICS
          </Text>
          <IconButton
            aria-label="Configurar HUD"
            icon={<FaCog />}
            size="xs"
            variant="ghost"
            onClick={onConfigOpen}
            _hover={{ color: "#4066ED" }}
          />
        </HStack>
        <HStack spacing={2}>
          <Badge colorScheme={getStakeColor(stakeSeleccionado)} size="sm">
            {getStakeLabel(stakeSeleccionado)}
          </Badge>
          <Badge colorScheme="blue" size="sm">
            {jugador.total_manos} hands
          </Badge>
        </HStack>
      </HStack>

      {/* TABLA HUD PROFESIONAL con configuración personalizada */}
      <Box 
        overflowX="auto" 
        bg={hudBg}
        p={{ base: 1, md: 2 }}
        borderRadius="md"
      >
        <Grid 
          templateColumns={{ base: "repeat(6, 1fr)", md: "repeat(8, 1fr)", lg: "repeat(10, 1fr)" }}
          gap={{ base: "2px", md: "3px" }}
          fontSize="2xs"
        >
          {/* Renderizar secciones basadas en la configuración */}
          {Object.entries(sections).map(([section, { title, icon }]) => {
            const visibleStats = getVisibleOrderedStats(section);
            if (visibleStats.length === 0) return null;
            
            return (
              <HUDSection key={section} title={title} icon={icon}>
                {visibleStats.map(stat => {
                  const value = jugador[stat.dbField];
                  const displayValue = formatStatValue(value);
                  
                  return (
                    <HUDCell
                      key={stat.id}
                      stat={stat.id}
                      label={stat.label}
                      value={displayValue}
                      onClick={toggleStatSelection}
                      isSelected={selectedStats[stat.id] !== undefined}
                      colorRanges={statRanges[stat.id]}
                      tooltip={stat.tooltip}
                    />
                  );
                })}
              </HUDSection>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default HUDDisplay;