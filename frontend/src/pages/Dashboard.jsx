import React from 'react';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Grid,
  GridItem,
  List,
  ListItem,
  Badge,
  Input,
  Button,
  Flex,
  Select,
  useClipboard,
  useToast,
  useColorMode,
  useColorModeValue,
  IconButton,
  VStack,
  HStack,
  Divider,
  InputGroup,
  InputLeftElement,
  Icon,
  FormControl,
  FormLabel,
  Tooltip,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Checkbox,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, SearchIcon, CalendarIcon } from '@chakra-ui/icons';
import {
  FaHandPaper,
  FaDollarSign,
  FaChartLine,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaSyncAlt,
  FaWalking,
  FaHandPointUp,
  FaPercentage,
  FaWater,
  FaExclamationTriangle,
  FaMedal,
  FaSearch,
  FaStar,
  FaDatabase,
  FaUsers,
  FaUserTie,
  FaCopyright,
  FaCalendarAlt,
  FaLayerGroup,
  FaCheckCircle,
  FaExclamationCircle,
  FaHandRock,
  FaHandshake,
  FaTrophy,
  FaChessKnight,
  FaCog,
  FaGripVertical,
  FaEye,
  FaEyeSlash,
  FaCopy,
} from "react-icons/fa";
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../services/api';
import GraficoGanancias from '../components/GraficoGanancias';
import AnalisisJugador from '../components/AnalisisJugador';
import { useAuth } from '../context/AuthContext';
import _ from 'lodash';
import { gradients, brand, stats, money } from '../theme/colors';
import { useStatColor } from '../hooks/useStatColor';

// Configuración de colores y rangos para cada estadística
const statRanges = {
  VPIP: [
    { min: 0, max: 15, color: 'blue.400', label: 'Nit' },
    { min: 15, max: 22, color: 'green.400', label: 'TAG' },
    { min: 22, max: 28, color: 'yellow.400', label: 'LAG' },
    { min: 28, max: 35, color: 'orange.400', label: 'Loose' },
    { min: 35, max: 100, color: 'red.400', label: 'Fish' }
  ],
  PFR: [
    { min: 0, max: 12, color: 'blue.400', label: 'Nit' },
    { min: 12, max: 18, color: 'green.400', label: 'TAG' },
    { min: 18, max: 25, color: 'yellow.400', label: 'LAG' },
    { min: 25, max: 30, color: 'orange.400', label: 'Loose' },
    { min: 30, max: 100, color: 'red.400', label: 'Maniac' }
  ],
  '3Bet': [
    { min: 0, max: 4, color: 'blue.400', label: 'Tight' },
    { min: 4, max: 7, color: 'green.400', label: 'Balanced' },
    { min: 7, max: 10, color: 'yellow.400', label: 'Aggressive' },
    { min: 10, max: 15, color: 'orange.400', label: 'Very Aggressive' },
    { min: 15, max: 100, color: 'red.400', label: 'Maniac' }
  ],
  'F3B': [
    { min: 0, max: 50, color: 'red.400', label: 'Calls too much' },
    { min: 50, max: 60, color: 'orange.400', label: 'Sticky' },
    { min: 60, max: 70, color: 'green.400', label: 'Balanced' },
    { min: 70, max: 80, color: 'yellow.400', label: 'Tight' },
    { min: 80, max: 100, color: 'blue.400', label: 'Overfolds' }
  ],
  'AF': [
    { min: 0, max: 1, color: 'blue.400', label: 'Passive' },
    { min: 1, max: 2, color: 'green.400', label: 'Balanced' },
    { min: 2, max: 3, color: 'yellow.400', label: 'Aggressive' },
    { min: 3, max: 4, color: 'orange.400', label: 'Very Aggressive' },
    { min: 4, max: 100, color: 'red.400', label: 'Hyper Aggressive' }
  ],
  'WTSD': [
    { min: 0, max: 20, color: 'blue.400', label: 'Folds too much' },
    { min: 20, max: 25, color: 'green.400', label: 'Balanced' },
    { min: 25, max: 30, color: 'yellow.400', label: 'Calls light' },
    { min: 30, max: 35, color: 'orange.400', label: 'Station' },
    { min: 35, max: 100, color: 'red.400', label: 'Calling Station' }
  ],
  'WSD': [
    { min: 0, max: 45, color: 'red.400', label: 'Weak' },
    { min: 45, max: 50, color: 'orange.400', label: 'Below average' },
    { min: 50, max: 55, color: 'green.400', label: 'Balanced' },
    { min: 55, max: 60, color: 'yellow.400', label: 'Strong' },
    { min: 60, max: 100, color: 'blue.400', label: 'Very Strong' }
  ],
  'CBet': [
    { min: 0, max: 50, color: 'blue.400', label: 'Passive' },
    { min: 50, max: 65, color: 'green.400', label: 'Balanced' },
    { min: 65, max: 75, color: 'yellow.400', label: 'Aggressive' },
    { min: 75, max: 85, color: 'orange.400', label: 'Very Aggressive' },
    { min: 85, max: 100, color: 'red.400', label: 'Over CBets' }
  ],
  'FCBET': [
    { min: 0, max: 40, color: 'red.400', label: 'Calls too much' },
    { min: 40, max: 50, color: 'orange.400', label: 'Sticky' },
    { min: 50, max: 60, color: 'green.400', label: 'Balanced' },
    { min: 60, max: 70, color: 'yellow.400', label: 'Tight' },
    { min: 70, max: 100, color: 'blue.400', label: 'Overfolds' }
  ]
};

// Tooltips con explicaciones de cada stat
const statTooltips = {
  VPIP: "Voluntarily Put money In Pot - % de manos que juega voluntariamente",
  PFR: "Pre-Flop Raise - % de manos que sube preflop",
  '3Bet': "% de veces que hace 3-bet cuando tiene la oportunidad",
  'F3B': "Fold to 3-Bet - % que foldea ante un 3-bet",
  '4Bet': "% de veces que hace 4-bet cuando tiene la oportunidad",
  'F4B': "Fold to 4-Bet - % que foldea ante un 4-bet",
  'SQZ': "Squeeze - % que hace squeeze (3-bet después de call)",
  'LIMP': "% de veces que solo iguala el big blind preflop",
  'LF': "Limp/Fold - % que foldea después de limpear",
  'LR': "Limp/Raise - % que sube después de limpear",
  'AF': "Aggression Factor - (Bets + Raises) / Calls",
  'WWSF': "Won When Saw Flop - % que gana cuando ve el flop",
  'WTSD': "Went To ShowDown - % que llega al showdown",
  'WSD': "Won ShowDown - % que gana en el showdown",
  'CBet': "Continuation Bet Flop - % que apuesta continuación en flop",
  'FCBET': "Fold to CBet - % que foldea ante CBet",
  'CBetT': "Continuation Bet Turn - % que apuesta continuación en turn",
  'FCBetT': "Fold to CBet Turn - % que foldea ante CBet en turn",
  'CBetR': "Continuation Bet River - % que apuesta continuación en river",
  'PROBE': "Probe Bet - % que apuesta cuando el agresor no continúa",
  'BetR': "Bet River - % que apuesta en el river",
  'FBetR': "Fold to Bet River - % que foldea ante apuesta en river",
  'OBT': "Overbet Turn - % que hace overbet en turn",
  'OBR': "Overbet River - % que hace overbet en river",
  'XRF': "Check-Raise Flop - % que hace check-raise en flop",
  'XRT': "Check-Raise Turn - % que hace check-raise en turn",
  'DONK': "Donk Bet - % que apuesta fuera de posición al agresor",
  'FLOAT': "Float Flop - % que hace call con intención de robar después",
  'STEAL': "Steal Turn - % que roba el bote en turn",
  'B&F': "Bet & Fold River - % que apuesta y foldea en river",
  'AI BB': "All-In Adjusted BB/100 - Winrate ajustado por all-ins",
  'CBet IP': "Continuation Bet In Position - % CBet en posición",
  'CBet OOP': "Continuation Bet Out of Position - % CBet fuera de posición",
  'FOBT': "Fold to Overbet Turn - % que foldea ante overbet en turn",
  'FOBR': "Fold to Overbet River - % que foldea ante overbet en river",
  'BRS': "Bet River Small - % que apuesta pequeño en river",
  'BRB': "Bet River Big - % que apuesta grande en river",
  'WSDBR': "Won Showdown with Bet River - % que gana showdown cuando apuesta river",
  'WSDOBR': "Won Showdown with Overbet River - % que gana showdown con overbet river",
  'WSDRR': "Won Showdown with River Raise - % que gana showdown con raise river",
  'WWRBS': "Won Without River Bet Small - % que gana sin apostar pequeño river",
  'WWRBB': "Won Without River Bet Big - % que gana sin apostar grande river"
};

// Configuración de todas las estadísticas disponibles
const ALL_STATS = {
  preflop: [
    { id: 'VPIP', label: 'VPIP', dbField: 'vpip', tooltip: statTooltips.VPIP },
    { id: 'PFR', label: 'PFR', dbField: 'pfr', tooltip: statTooltips.PFR },
    { id: '3Bet', label: '3B', dbField: 'three_bet', tooltip: statTooltips['3Bet'] },
    { id: 'F3B', label: 'F3B', dbField: 'fold_to_3bet_pct', tooltip: statTooltips.F3B },
    { id: '4Bet', label: '4B', dbField: 'four_bet_preflop_pct', tooltip: statTooltips['4Bet'] },
    { id: 'F4B', label: 'F4B', dbField: 'fold_to_4bet_pct', tooltip: statTooltips.F4B },
    { id: 'SQZ', label: 'SQZ', dbField: 'squeeze', tooltip: statTooltips.SQZ },
    { id: 'LIMP', label: 'LIMP', dbField: 'limp_pct', tooltip: statTooltips.LIMP },
    { id: 'LF', label: 'L/F', dbField: 'limp_fold_pct', tooltip: statTooltips.LF, premium: true },
    { id: 'LR', label: 'L/R', dbField: 'limp_raise_pct', tooltip: statTooltips.LR, premium: true },
  ],
  postflop: [
    { id: 'AF', label: 'AF', dbField: 'aggression_factor', tooltip: statTooltips.AF },
    { id: 'WWSF', label: 'WWSF', dbField: 'wwsf', tooltip: statTooltips.WWSF },
    { id: 'WTSD', label: 'WTSD', dbField: 'wtsd', tooltip: statTooltips.WTSD },
    { id: 'WSD', label: 'WSD', dbField: 'wsd', tooltip: statTooltips.WSD },
    { id: 'AIBB', label: 'AIBB', dbField: 'all_in_adj_bb_100', tooltip: statTooltips['AI BB'] },
  ],
  flop: [
    { id: 'CB', label: 'CB', dbField: 'cbet_flop', tooltip: statTooltips.CBet },
    { id: 'FCB', label: 'FCB', dbField: 'fold_to_flop_cbet_pct', tooltip: statTooltips.FCBET },
    { id: 'CBIP', label: 'CB-IP', dbField: 'cbet_flop_ip', tooltip: statTooltips['CBet IP'] },
    { id: 'CBOOP', label: 'CB-OOP', dbField: 'cbet_flop_oop', tooltip: statTooltips['CBet OOP'] },
    { id: 'XRF', label: 'X/R', dbField: 'check_raise_flop', tooltip: statTooltips.XRF },
    { id: 'DONK', label: 'DONK', dbField: 'donk_flop', tooltip: statTooltips.DONK },
    { id: 'FLOAT', label: 'FLOAT', dbField: 'float_flop', tooltip: statTooltips.FLOAT, premium: true },
  ],
  turn: [
    { id: 'CBT', label: 'CB-T', dbField: 'cbet_turn', tooltip: statTooltips.CBetT },
    { id: 'FCBT', label: 'FCB-T', dbField: 'fold_to_turn_cbet_pct', tooltip: statTooltips.FCBetT },
    { id: 'PROBE', label: 'PROBE', dbField: 'probe_bet_turn_pct', tooltip: statTooltips.PROBE },
    { id: 'OBT', label: 'OB-T', dbField: 'overbet_turn_pct', tooltip: statTooltips.OBT },
    { id: 'FOBT', label: 'FOB-T', dbField: 'fold_to_turn_overbet', tooltip: statTooltips.FOBT, premium: true },
    { id: 'XRT', label: 'X/R-T', dbField: 'check_raise_turn', tooltip: statTooltips.XRT, premium: true },
    { id: 'STEAL', label: 'STEAL', dbField: 'steal_turn', tooltip: statTooltips.STEAL, premium: true },
  ],
  river: [
    { id: 'CBR', label: 'CB-R', dbField: 'cbet_river', tooltip: statTooltips.CBetR },
    { id: 'BETR', label: 'BET-R', dbField: 'bet_river_pct', tooltip: statTooltips.BetR },
    { id: 'FBR', label: 'FB-R', dbField: 'fold_to_river_bet_pct', tooltip: statTooltips.FBetR },
    { id: 'OBR', label: 'OB-R', dbField: 'overbet_river_pct', tooltip: statTooltips.OBR },
    { id: 'FOBR', label: 'FOB-R', dbField: 'fold_to_river_overbet', tooltip: statTooltips.FOBR, premium: true },
    { id: 'BF', label: 'B&F', dbField: 'bet_river_fold', tooltip: statTooltips['B&F'], premium: true },
    { id: 'BRS', label: 'BR-S', dbField: 'bet_river_small_pot', tooltip: statTooltips.BRS, premium: true },
    { id: 'BRB', label: 'BR-B', dbField: 'bet_river_big_pot', tooltip: statTooltips.BRB, premium: true },
  ],
  showdown: [
    { id: 'WSDBR', label: 'WSDBR', dbField: 'wsdwbr_pct', tooltip: statTooltips.WSDBR, premium: true },
    { id: 'WSDOBR', label: 'WSDOBR', dbField: 'wsdwobr', tooltip: statTooltips.WSDOBR, premium: true },
    { id: 'WSDRR', label: 'WSDRR', dbField: 'wsdwrr', tooltip: statTooltips.WSDRR, premium: true },
    { id: 'WWRBS', label: 'WWRBS', dbField: 'wwrb_small', tooltip: statTooltips.WWRBS, premium: true },
    { id: 'WWRBB', label: 'WWRBB', dbField: 'wwrb_big', tooltip: statTooltips.WWRBB, premium: true },
  ]
};

// Configuración por defecto
const DEFAULT_HUD_CONFIG = {
  visibleStats: {
    preflop: ['VPIP', 'PFR', '3Bet', 'F3B', '4Bet', 'F4B', 'SQZ', 'LIMP'],
    postflop: ['AF', 'WWSF', 'WTSD', 'WSD', 'AIBB'],
    flop: ['CB', 'FCB', 'CBIP', 'CBOOP', 'XRF', 'DONK'],
    turn: ['CBT', 'FCBT', 'PROBE', 'OBT'],
    river: ['CBR', 'BETR', 'FBR', 'OBR'],
    showdown: []
  },
  autoCopyStats: ['VPIP', 'PFR', '3Bet', 'WTSD', 'WSD'],
  statOrder: {
    preflop: ['VPIP', 'PFR', '3Bet', 'F3B', '4Bet', 'F4B', 'SQZ', 'LIMP', 'LF', 'LR'],
    postflop: ['AF', 'WWSF', 'WTSD', 'WSD', 'AIBB'],
    flop: ['CB', 'FCB', 'CBIP', 'CBOOP', 'XRF', 'DONK', 'FLOAT'],
    turn: ['CBT', 'FCBT', 'PROBE', 'OBT', 'FOBT', 'XRT', 'STEAL'],
    river: ['CBR', 'BETR', 'FBR', 'OBR', 'FOBR', 'BF', 'BRS', 'BRB'],
    showdown: ['WSDBR', 'WSDOBR', 'WSDRR', 'WWRBS', 'WWRBB']
  }
};

// Función para obtener el color según el valor y el tipo de stat
const getStatColor = (statType, value) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'gray.400';
  
  const ranges = statRanges[statType] || statRanges['VPIP'];
  
  for (const range of ranges) {
    if (numValue >= range.min && numValue < range.max) {
      return range.color;
    }
  }
  
  return 'gray.400';
};

// Componente HUD Cell mejorado
const HUDCell = ({ stat, value, label, onClick, isSelected, tooltip, colorRanges }) => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const selectedBg = useColorModeValue("blue.100", "blue.900");
  const selectedBorder = useColorModeValue("blue.400", "blue.400");
  
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
          bg: isSelected ? selectedBg : useColorModeValue("gray.100", "gray.800"),
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

// Componente de sección de HUD
const HUDSection = ({ title, children, icon }) => {
  const bgColor = useColorModeValue("gray.700", "gray.800");
  const textColor = useColorModeValue("gray.100", "gray.100");
  
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

// Componente de Configuración del HUD
const HUDConfigModal = ({ isOpen, onClose, hudConfig, setHudConfig, tieneSuscripcionAvanzada }) => {
  const [localConfig, setLocalConfig] = useState(hudConfig);
  
  const handleStatVisibilityToggle = (section, statId) => {
    setLocalConfig(prev => {
      const newConfig = { ...prev };
      const visibleStats = [...newConfig.visibleStats[section]];
      const index = visibleStats.indexOf(statId);
      
      if (index > -1) {
        visibleStats.splice(index, 1);
      } else {
        visibleStats.push(statId);
      }
      
      newConfig.visibleStats[section] = visibleStats;
      return newConfig;
    });
  };

  const handleAutoCopyToggle = (statId) => {
    setLocalConfig(prev => {
      const newConfig = { ...prev };
      const autoCopyStats = [...newConfig.autoCopyStats];
      const index = autoCopyStats.indexOf(statId);
      
      if (index > -1) {
        autoCopyStats.splice(index, 1);
      } else {
        autoCopyStats.push(statId);
      }
      
      newConfig.autoCopyStats = autoCopyStats;
      return newConfig;
    });
  };

  const handleDragEnd = (result, section) => {
    if (!result.destination) return;

    setLocalConfig(prev => {
      const newConfig = { ...prev };
      const items = Array.from(newConfig.statOrder[section]);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      newConfig.statOrder[section] = items;
      return newConfig;
    });
  };

  const saveConfig = () => {
    setHudConfig(localConfig);
    localStorage.setItem('hudConfig', JSON.stringify(localConfig));
    onClose();
  };

  const resetConfig = () => {
    setLocalConfig(DEFAULT_HUD_CONFIG);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={FaCog} />
            <Text>Configuración del HUD</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Visibilidad</Tab>
              <Tab>Auto-Copiar</Tab>
              <Tab>Orden</Tab>
            </TabList>

            <TabPanels>
              {/* Panel de Visibilidad */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Alert status="info" fontSize="sm">
                    <AlertIcon />
                    Selecciona qué estadísticas quieres ver en tu HUD
                  </Alert>
                  
                  {Object.entries(ALL_STATS).map(([section, stats]) => (
                    <Box key={section}>
                      <Text fontWeight="bold" mb={2} textTransform="capitalize">
                        {section}
                      </Text>
                      <SimpleGrid columns={3} spacing={2}>
                        {stats.map(stat => {
                          const isVisible = localConfig.visibleStats[section].includes(stat.id);
                          const isPremium = stat.premium && !tieneSuscripcionAvanzada;
                          
                          return (
                            <Checkbox
                              key={stat.id}
                              isChecked={isVisible}
                              onChange={() => !isPremium && handleStatVisibilityToggle(section, stat.id)}
                              isDisabled={isPremium}
                            >
                              <HStack spacing={1}>
                                <Text fontSize="sm">{stat.label}</Text>
                                {isPremium && (
                                  <Badge colorScheme="purple" fontSize="xs">PRO</Badge>
                                )}
                              </HStack>
                            </Checkbox>
                          );
                        })}
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </TabPanel>

              {/* Panel de Auto-Copiar */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Alert status="info" fontSize="sm">
                    <AlertIcon />
                    Estas estadísticas se seleccionarán automáticamente para copiar en cada búsqueda
                  </Alert>
                  
                  {Object.entries(ALL_STATS).map(([section, stats]) => (
                    <Box key={section}>
                      <Text fontWeight="bold" mb={2} textTransform="capitalize">
                        {section}
                      </Text>
                      <SimpleGrid columns={3} spacing={2}>
                        {stats.map(stat => {
                          const isAutoCopy = localConfig.autoCopyStats.includes(stat.id);
                          const isPremium = stat.premium && !tieneSuscripcionAvanzada;
                          
                          return (
                            <Checkbox
                              key={stat.id}
                              isChecked={isAutoCopy}
                              onChange={() => !isPremium && handleAutoCopyToggle(stat.id)}
                              isDisabled={isPremium}
                            >
                              <HStack spacing={1}>
                                <Icon as={FaCopy} boxSize={3} />
                                <Text fontSize="sm">{stat.label}</Text>
                                {isPremium && (
                                  <Badge colorScheme="purple" fontSize="xs">PRO</Badge>
                                )}
                              </HStack>
                            </Checkbox>
                          );
                        })}
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </TabPanel>

              {/* Panel de Orden */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Alert status="info" fontSize="sm">
                    <AlertIcon />
                    Arrastra y suelta para reorganizar las estadísticas
                  </Alert>
                  
                  <Accordion allowMultiple>
                    {Object.entries(ALL_STATS).map(([section, stats]) => (
                      <AccordionItem key={section}>
                        <h2>
                          <AccordionButton>
                            <Box flex="1" textAlign="left" fontWeight="bold" textTransform="capitalize">
                              {section}
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <DragDropContext onDragEnd={(result) => handleDragEnd(result, section)}>
                            <Droppable droppableId={section}>
                              {(provided) => (
                                <VStack
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  spacing={2}
                                  align="stretch"
                                >
                                  {localConfig.statOrder[section].map((statId, index) => {
                                    const stat = stats.find(s => s.id === statId);
                                    if (!stat) return null;
                                    
                                    return (
                                      <Draggable
                                        key={statId}
                                        draggableId={statId}
                                        index={index}
                                      >
                                        {(provided, snapshot) => (
                                          <HStack
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            p={2}
                                            bg={snapshot.isDragging ? "blue.100" : "gray.50"}
                                            borderRadius="md"
                                            spacing={3}
                                          >
                                            <Icon as={FaGripVertical} color="gray.400" />
                                            <Text fontWeight="medium">{stat.label}</Text>
                                            <Text fontSize="sm" color="gray.600" flex="1" noOfLines={1}>
                                              {stat.tooltip}
                                            </Text>
                                          </HStack>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                </VStack>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={resetConfig}>
            Restaurar por defecto
          </Button>
          <Button colorScheme="blue" onClick={saveConfig}>
            Guardar configuración
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Dashboard = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  // Valores de color mejorados
  const mainGradient = gradients.main;
  const cardBg = useColorModeValue("white", "gray.800");
  const suggestionBg = useColorModeValue("white", "gray.700");
  const suggestionBorderColor = useColorModeValue("gray.200", "gray.600");
  const iconButtonColor = brand.primary;
  const selectFocusBorderColor = brand.primary;
  const inputBg = useColorModeValue("white", "gray.700");
  const inputFocusBorderColor = brand.primary;
  const listItemHoverBg = useColorModeValue("gray.100", "gray.600");
  const pageBg = useColorModeValue("#f8fafc", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const tabBg = useColorModeValue("gray.50", "gray.700");

  const authData = useAuth();
  const auth = authData?.auth;
  const [jugador, setJugador] = useState(null);
  const [nombreBuscado, setNombreBuscado] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const sugerenciasRef = useRef(null);
  const [salaSeleccionada, setSalaSeleccionada] = useState("XPK");

  // Estados para filtros
  const [tipoPeriodo, setTipoPeriodo] = useState("total");
  const [stakeFilter, setStakeFilter] = useState("all");

  // Estado para estadísticas y copiado
  const [selectedStats, setSelectedStats] = useState({});
  const { onCopy, setValue } = useClipboard("");
  const [statsText, setStatsText] = useState("");
  const toast = useToast();

  // Estados para favoritos
  const [esFavorito, setEsFavorito] = useState(false);
  const [favoritos, setFavoritos] = useState([]);

  // Estados para multi-stake
  const [stakesDisponibles, setStakesDisponibles] = useState([]);
  const [stakeSeleccionado, setStakeSeleccionado] = useState(null);
  const [loadingStakes, setLoadingStakes] = useState(false);

  // Estados para configuración del HUD
  const [hudConfig, setHudConfig] = useState(() => {
    const savedConfig = localStorage.getItem('hudConfig');
    return savedConfig ? JSON.parse(savedConfig) : DEFAULT_HUD_CONFIG;
  });
  const { isOpen: isConfigOpen, onOpen: onConfigOpen, onClose: onConfigClose } = useDisclosure();

  // Función para obtener sugerencias
  const fetchSugerencias = useCallback(async (query) => {
    if (query.length < 3) {
      setSugerencias([]);
      return;
    }
    try {
      const res = await api.get(`/jugador/autocomplete/${salaSeleccionada}/${query}`);
      setSugerencias(res.data);
      setMostrarSugerencias(true);
    } catch (error) {
      console.error("Error al obtener sugerencias:", error);
    }
  }, [salaSeleccionada]);

  // Debounce de la función de sugerencias
  const debouncedFetchSugerencias = useMemo(
    () => _.debounce(fetchSugerencias, 300),
    [fetchSugerencias]
  );

  // Manejo del input
  const handleInputChange = useCallback((e) => {
    setNombreBuscado(e.target.value);
    debouncedFetchSugerencias(e.target.value);
  }, [debouncedFetchSugerencias]);

  // Función para buscar todos los stakes del jugador
  const buscarStakesJugador = useCallback(async (nombre) => {
    setLoadingStakes(true);
    try {
      const url = `/jugador/${salaSeleccionada}/${encodeURIComponent(nombre)}/stakes?tipoPeriodo=${tipoPeriodo}`;
      const res = await api.get(url);
      
      if (res.data && res.data.stakes_disponibles) {
        const stakesConDatos = res.data.stakes_disponibles;
        setStakesDisponibles(stakesConDatos);
        
        if (stakesConDatos.length > 0) {
          setStakeSeleccionado(stakesConDatos[0].stake);
          setJugador(stakesConDatos[0].data);
        }
      }
    } catch (error) {
      console.error("Error buscando stakes:", error);
      try {
        const fallbackUrl = `/jugador/${salaSeleccionada}/${encodeURIComponent(nombre)}?tipoPeriodo=${tipoPeriodo}`;
        const fallbackRes = await api.get(fallbackUrl);
        
        if (fallbackRes.data) {
          setStakesDisponibles([{
            stake: fallbackRes.data.stake_category || 'unknown',
            manos: fallbackRes.data.total_manos,
            data: fallbackRes.data
          }]);
          setJugador(fallbackRes.data);
        }
      } catch (fallbackError) {
        console.error("Error en fallback:", fallbackError);
      }
    } finally {
      setLoadingStakes(false);
    }
  }, [salaSeleccionada, tipoPeriodo]);

  // Función para buscar jugador
  const buscarJugador = useCallback(async (nombre) => {
    setLoading(true);
    setSugerencias([]);
    setSelectedStats({});
    setStakesDisponibles([]);
    
    try {
      await buscarStakesJugador(nombre);
      
      if (auth?.token) {
        try {
          const resFavorito = await api.get(
            `/favoritos/${salaSeleccionada}/${encodeURIComponent(nombre)}`,
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );
          setEsFavorito(resFavorito.data.favorito);
        } catch (error) {
          setEsFavorito(false);
          console.error("Error al verificar favorito:", error);
        }
      }
    } catch (error) {
      console.error("Jugador no encontrado:", error);
      setJugador(null);
      setEsFavorito(false);
      
      toast({
        title: "Jugador no encontrado",
        description: "Verifica el nombre del jugador e inténtalo nuevamente",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
    setLoading(false);
  }, [salaSeleccionada, auth?.token, tipoPeriodo, toast, buscarStakesJugador]);

  // Función para cambiar stake seleccionado
  const cambiarStake = useCallback((nuevoStake) => {
    const stakeData = stakesDisponibles.find(s => s.stake === nuevoStake);
    if (stakeData) {
      setStakeSeleccionado(nuevoStake);
      setJugador(stakeData.data);
      setSelectedStats({});
    }
  }, [stakesDisponibles]);
  
  // Alternar favorito
  const toggleFavorito = async () => {
    if (!jugador) return;
  
    try {
      if (esFavorito) {
        await api.delete(`/favoritos/${salaSeleccionada}/${encodeURIComponent(jugador.player_name)}`, {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setEsFavorito(false);
        setFavoritos((prev) => prev.filter((fav) => fav.player_name !== jugador.player_name));
      } else {
        await api.post(
          "/favoritos",
          { player_name: jugador.player_name, sala: salaSeleccionada },
          { headers: { Authorization: `Bearer ${auth?.token}` } }
        );
        setEsFavorito(true);
        setFavoritos((prev) => [...prev, { player_name: jugador.player_name, sala: salaSeleccionada }]);
      }
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
    }
  };

  // Buscar jugador predeterminado al montar
  useEffect(() => {
    buscarJugador("LALIGAMANAGER");
  }, [buscarJugador]);

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const res = await api.get("/favoritos", {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setFavoritos(res.data);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
      }
    };

    if (auth?.token) {
      fetchFavoritos();
    }
  }, [auth?.token]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sugerenciasRef.current && !sugerenciasRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cancelar el debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedFetchSugerencias.cancel();
    };
  }, [debouncedFetchSugerencias]);

  // Auto-seleccionar stats basadas en la configuración
  useEffect(() => {
    if (jugador && hudConfig.autoCopyStats.length > 0) {
      const autoSelectedStats = {};
      hudConfig.autoCopyStats.forEach(statId => {
        // Buscar el stat en todas las secciones
        for (const [section, stats] of Object.entries(ALL_STATS)) {
          const stat = stats.find(s => s.id === statId);
          if (stat && jugador[stat.dbField] !== undefined) {
            const value = typeof jugador[stat.dbField] === 'number' 
              ? `${jugador[stat.dbField]}%` 
              : jugador[stat.dbField];
            autoSelectedStats[statId] = value;
          }
        }
      });
      setSelectedStats(autoSelectedStats);
    }
  }, [jugador, hudConfig.autoCopyStats]);

  // Función de toggle para estadísticas
  const toggleStatSelection = useCallback((title, value) => {
    setSelectedStats((prev) => {
      if (prev[title] !== undefined) {
        const newStats = { ...prev };
        delete newStats[title];
        return newStats;
      } else {
        return {
          ...prev,
          [title]: value
        };
      }
    });
  }, []);

  // Actualizar el texto de estadísticas
  useEffect(() => {
    const computedStatsText = Object.entries(selectedStats)
      .filter(([_, value]) => value !== undefined)
      .map(([title, value]) => `${title}: ${value}`)
      .join("\n");
    setStatsText(computedStatsText);
  }, [selectedStats]);

  const statAbbreviations = {
    "VPIP": "VPIP",
    "PFR": "PFR",
    "3Bet": "3B",
    "F3B": "F3B",
    "4Bet": "4B",
    "F4B": "F4B",
    "SQZ": "SQZ",
    "CBet": "CBF",
    "CB": "CB",
    "FCB": "FCB",
    "CBT": "CBT",
    "CBR": "CBR",
    "WWSF": "WWSF",
    "WTSD": "WTSD",
    "WSD": "WSD",
    "LIMP": "LIMP",
    "LF": "LF",
    "LR": "LR",
    "FCBET": "FCB",
    "FCBT": "FCBT",
    "FBR": "FBR",
    "PROBE": "PROBE",
    "BETR": "BR",
    "OBT": "OBT",
    "OBR": "OBR",
    "FOBT": "FOBT",
    "FOBR": "FOBR",
    "XRF": "XRF",
    "XRT": "XRT",
    "CBIP": "CBIP",
    "CBOOP": "CBOOP",
    "DONK": "DONK",
    "FLOAT": "FLOAT",
    "STEAL": "STEAL",
    "BF": "BFR",
    "BRS": "BRS",
    "BRB": "BRB",
    "WSDBR": "WSDBR",
    "WSDOBR": "WSDOBR",
    "WSDRR": "WSDRR",
    "WWRBS": "WWRBS",
    "WWRBB": "WWRBB",
    "AIBB": "AIBB",
    "AF": "AF"
  };

  const copyStats = () => {
    const statsText = Object.entries(selectedStats)
      .filter(([_, value]) => value !== undefined)
      .map(([title, value]) => {
        const cleanTitle = title.replace(/\s+/g, " ").trim();
        const abbreviation = statAbbreviations[cleanTitle] || cleanTitle.replace(/\s+/g, "");
  
        let numericValue = value;
        const numberMatch = value.match(/[-]?\d+(\.\d+)?/);
        if (numberMatch) {
          const number = parseFloat(numberMatch[0]);
          const rounded = Math.round(number);
          const hasPercent = value.includes("%");
          const hasDollar = value.includes("$");
          numericValue = `${hasDollar ? "$" : ""}${rounded}`;
        }
  
        return `${abbreviation}:${numericValue}`;
      })
      .join("/");
  
    if (!statsText) {
      toast({
        title: "No hay estadísticas seleccionadas",
        description: "Selecciona al menos una estadística antes de copiar.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
  
    navigator.clipboard.writeText(statsText)
      .then(() => {
        toast({
          title: "Estadísticas copiadas",
          description: "Ahora puedes pegarlas en la app de poker",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar al portapapeles",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  };

  // Función helper para obtener color del stake
  const getStakeColor = (stake) => {
    switch (stake) {
      case 'microstakes': return 'green';
      case 'nl100': return 'blue';
      case 'nl200': return 'purple';
      case 'nl400': return 'orange';
      case 'high-stakes': return 'red';
      default: return 'gray';
    }
  };

  // Función helper para obtener label del stake
  const getStakeLabel = (stake) => {
    switch (stake) {
      case 'microstakes': return 'Micro';
      case 'nl100': return 'NL100';
      case 'nl200': return 'NL200';
      case 'nl400': return 'NL400';
      case 'high-stakes': return 'High Stakes';
      default: return stake?.toUpperCase() || 'N/A';
    }
  };

  // Función helper para obtener stats visibles y ordenadas
  const getVisibleOrderedStats = (section) => {
    const visibleIds = hudConfig.visibleStats[section];
    const orderedIds = hudConfig.statOrder[section];
    
    return orderedIds
      .filter(id => visibleIds.includes(id))
      .map(id => ALL_STATS[section].find(stat => stat.id === id))
      .filter(stat => stat && (!stat.premium || tieneSuscripcionAvanzada));
  };

  if (auth === undefined) return <Spinner />;

  const tieneSuscripcionAvanzada = ["plata", "oro"].includes(auth.suscripcion);

  return (
    <Box minH="100vh" bg={pageBg} p={4}>
      <Box maxW="1400px" mx="auto">
        {/* Header mejorado con degradado */}
        <Box 
          bgGradient={mainGradient}
          borderRadius="xl" 
          py={6} 
          px={8} 
          mb={6}
          boxShadow="lg"
        >
          <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
            <VStack align="flex-start" spacing={1}>
              <HStack>
                <FaDatabase color="white" fontSize="1.25rem" />
                <Heading size="lg" color="white" fontWeight="bold">
                  PokerProStats
                </Heading>
              </HStack>
              <Text color="whiteAlpha.800" fontSize="sm">
                Análisis avanzado de jugadores con IA
              </Text>
            </VStack>
            
            <HStack spacing={4}>
              <Link to="/favoritos">
                <Button 
                  variant="solid" 
                  size="md"
                  colorScheme="whiteAlpha"
                  leftIcon={<FaStar />}
                  _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
                >
                  Favoritos
                </Button>
              </Link>
              
              <IconButton
                aria-label="Toggle Color Mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="solid"
                colorScheme="whiteAlpha"
                size="md"
              />
            </HStack>
          </Flex>
          
          {/* Búsqueda de jugador mejorada con filtros */}
          <Box mt={6}>
            <Flex gap={3} align="center" wrap="wrap">
              {/* Selector de sala */}
              <Select
                value={salaSeleccionada}
                onChange={(e) => setSalaSeleccionada(e.target.value)}
                maxW="120px"
                bg="whiteAlpha.200"
                color="white"
                borderColor="whiteAlpha.300"
                _hover={{ borderColor: "whiteAlpha.400" }}
                _focus={{ borderColor: "white" }}
                size="lg"
              >
                <option value="XPK" style={{ background: 'black' }}>X-Poker</option>
                <option value="PPP" style={{ background: 'black' }}>PPPoker</option>
                <option value="PM" style={{ background: 'black' }}>ClubGG</option>
              </Select>
              
              <Box position="relative" flex="1" maxW={{ base: "100%", md: "400px" }}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="whiteAlpha.700" />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar jugador por nombre..."
                    value={nombreBuscado}
                    onChange={handleInputChange}
                    onFocus={() => setMostrarSugerencias(true)}
                    bg="whiteAlpha.200"
                    color="white"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "whiteAlpha.400" }}
                    _focus={{ borderColor: "white" }}
                    _placeholder={{ color: "whiteAlpha.700" }}
                  />
                </InputGroup>
                
                {mostrarSugerencias && sugerencias.length > 0 && (
                  <List
                    ref={sugerenciasRef}
                    borderWidth="1px"
                    borderColor={suggestionBorderColor}
                    borderRadius="md"
                    mt={1}
                    bg={suggestionBg}
                    position="absolute"
                    width="100%"
                    maxWidth="100%"
                    boxShadow="xl"
                    zIndex="10"
                    maxH="300px"
                    overflowY="auto"
                  >
                    {sugerencias.map((jug, index) => (
                      <ListItem
                        key={index}
                        p={3}
                        cursor="pointer"
                        _hover={{ background: listItemHoverBg }}
                        onClick={() => {
                          setNombreBuscado(jug.player_name);
                          buscarJugador(jug.player_name);
                          setMostrarSugerencias(false);
                        }}
                        borderBottom="1px solid"
                        borderColor="gray.100"
                        transition="all 0.2s"
                      >
                        <Flex align="center">
                          <Icon as={FaUserTie} mr={2} color="gray.500" />
                          {jug.player_name}
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
              
              <Button
                size="lg"
                bg="white"
                color={brand.primary}
                _hover={{ 
                  bg: "gray.50",
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
                leftIcon={<FaSearch />}
                onClick={() => buscarJugador(nombreBuscado)}
                transition="all 0.2s"
              >
                Buscar
              </Button>

              {/* Selector de período */}
              <Select
                value={tipoPeriodo}
                onChange={(e) => setTipoPeriodo(e.target.value)}
                maxW="150px"
                bg="whiteAlpha.200"
                color="white"
                borderColor="whiteAlpha.300"
                _hover={{ borderColor: "whiteAlpha.400" }}
                _focus={{ borderColor: "white" }}
                size="lg"
              >
                <option value="total" style={{ background: 'black' }}>Histórico</option>
                <option value="semana" style={{ background: 'black' }}>Semana</option>
                <option value="mes" style={{ background: 'black' }}>Mes</option>
              </Select>
            </Flex>

            {/* Info badges */}
            <HStack spacing={3} mt={3} wrap="wrap">
              <Badge colorScheme="blue" p={2}>
                <Icon as={FaDatabase} mr={1} />
                Fuente: CSV
              </Badge>
              <Badge colorScheme="purple" p={2}>
                <Icon as={FaChartLine} mr={1} />
                Período: {tipoPeriodo === 'total' ? 'Histórico Total' : tipoPeriodo === 'semana' ? 'Última Semana' : 'Último Mes'}
              </Badge>
            </HStack>
          </Box>
        </Box>

        {loading && (
          <Flex justify="center" my={10}>
            <Spinner size="xl" thickness="4px" color={brand.primary} />
          </Flex>
        )}
        
        {!loading && !jugador && (
          <Box 
            p={8} 
            bg={cardBg} 
            borderRadius="xl" 
            textAlign="center"
            boxShadow="base"
          >
            <VStack spacing={3}>
              <Icon as={FaSearch} boxSize={10} color="gray.400" />
              <Text fontSize="xl" color={textColor}>No se encontraron datos del jugador</Text>
              <Text color={subtextColor}>
                Intenta buscar por nombre o alias
              </Text>
            </VStack>
          </Box>
        )}

        {jugador && (
          <Box>
            <Flex 
              direction={{ base: "column", md: "row" }} 
              gap={6} 
              mb={6}
            >
              {/* Panel izquierdo - Información y análisis IA */}
              <Box 
                flex={{ base: "1", lg: "3" }} 
                maxW={{ base: "100%", lg: "65%" }}
              >
                <Box 
                  p={6} 
                  bg={cardBg} 
                  borderRadius="xl" 
                  boxShadow="base"
                  mb={6}
                  position="relative"
                  overflow="hidden"
                >
                  <Box 
                    position="absolute" 
                    top="-10%" 
                    right="-5%" 
                    w="200px" 
                    h="200px" 
                    bgGradient={mainGradient}
                    opacity="0.05"
                    borderRadius="full"
                    zIndex={0}
                  />
                  
                  <HStack mb={4} position="relative" zIndex={1}>
                    <Heading size="lg" color={textColor}>
                      Información del Jugador
                    </Heading>
                    <HStack>
                      {jugador.stake_category && (
                        <Badge 
                          colorScheme={getStakeColor(jugador.stake_category)} 
                          variant="solid"
                        >
                          <Icon as={FaLayerGroup} mr={1} />
                          {getStakeLabel(jugador.stake_category)}
                        </Badge>
                      )}
                      {tipoPeriodo !== 'total' && (
                        <Badge colorScheme="purple" variant="subtle">
                          <Icon as={FaChartLine} mr={1} />
                          {tipoPeriodo === 'semana' ? 'Semanal' : 'Mensual'}
                        </Badge>
                      )}
                    </HStack>
                  </HStack>
                  
                  <Flex 
                    mb={4} 
                    direction={{ base: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ base: "flex-start", sm: "center" }}
                    wrap="wrap"
                    gap={3}
                    position="relative"
                    zIndex={1}
                  >
                    <HStack spacing={3}>
                      <VStack align="flex-start" spacing={1}>
                        <Text color={subtextColor} fontSize="sm">Nickname</Text>
                        <HStack>
                          <Badge 
                            bg={brand.primary}
                            color="white" 
                            fontSize="2xl" 
                            p={2} 
                            borderRadius="md"
                          >
                            {jugador.player_name}
                          </Badge>
                          
                          <IconButton
                            aria-label={esFavorito ? "Eliminar de favoritos" : "Agregar a favoritos"}
                            icon={<Icon as={FaStar} color={esFavorito ? "yellow.400" : "gray.400"} />}
                            onClick={toggleFavorito}
                            variant="ghost"
                            size="md"
                            _hover={{ transform: "scale(1.1)" }}
                            transition="all 0.2s"
                          />
                        </HStack>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={6} wrap="wrap">
                      <VStack align="flex-start" spacing={0}>
                        <Text color={subtextColor} fontSize="sm">Manos jugadas</Text>
                        <Text fontSize="xl" fontWeight="bold" color={textColor}>
                          {jugador.total_manos}
                        </Text>
                      </VStack>
                      
                      <VStack align="flex-start" spacing={0}>
                        <Text color={subtextColor} fontSize="sm">Winrate</Text>
                        <Text 
                          fontSize="xl" 
                          fontWeight="bold" 
                          color={parseFloat(jugador.bb_100) > 0 ? "green.500" : parseFloat(jugador.bb_100) < 0 ? "red.500" : "gray.500"}
                        >
                          {jugador.bb_100} BB/100
                        </Text>
                      </VStack>
                      
                      <VStack align="flex-start" spacing={0}>
                        <Text color={subtextColor} fontSize="sm">Ganancias</Text>
                        <Text 
                          fontSize="xl" 
                          fontWeight="bold"
                          color={parseFloat(jugador.win_usd) > 0 ? "green.500" : parseFloat(jugador.win_usd) < 0 ? "red.500" : "gray.500"}
                        >
                          ${jugador.win_usd}
                        </Text>
                      </VStack>
                    </HStack>
                  </Flex>

                  {/* Selector de stake si hay múltiples */}
                  {stakesDisponibles.length > 1 && (
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
                  )}

                  {/* Información adicional del snapshot */}
                  {jugador.fecha_snapshot && (
                    <Box 
                      p={3} 
                      bg={useColorModeValue("gray.50", "gray.700")}
                      borderRadius="md" 
                      mb={4}
                      position="relative"
                      zIndex={1}
                    >
                      <HStack spacing={4} fontSize="sm" wrap="wrap">
                        <HStack>
                          <Icon as={FaCalendarAlt} color="gray.500" />
                          <Text color={subtextColor}>
                            <strong>Fecha datos:</strong> {new Date(jugador.fecha_snapshot).toLocaleDateString()}
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaDatabase} color="gray.500" />
                          <Text color={subtextColor}>
                            <strong>Fuente:</strong> {jugador.data_source || 'CSV'}
                          </Text>
                        </HStack>
                      </HStack>
                    </Box>
                  )}
                </Box>
                
                {/* Panel de análisis IA */}
                <AnalisisJugador
                  nombre={jugador.player_name}
                  salaSeleccionada={salaSeleccionada}
                  suscripcionUsuario={auth.suscripcion}
                  tipoPeriodo={tipoPeriodo}
                  fecha={jugador.fecha_snapshot}
                />
              </Box>
              
              {/* Panel derecho - HUD PROFESIONAL */}
              <Box 
                flex={{ base: "1", lg: "4" }} 
                maxW={{ base: "100%", lg: "70%" }}
              >
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
                      <Icon as={FaChartLine} color={brand.primary} />
                      <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>
                        HUD STATISTICS
                      </Text>
                      <IconButton
                        aria-label="Configurar HUD"
                        icon={<FaCog />}
                        size="xs"
                        variant="ghost"
                        onClick={onConfigOpen}
                        _hover={{ color: brand.primary }}
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

                  {/* Modal de configuración */}
                  <HUDConfigModal
                    isOpen={isConfigOpen}
                    onClose={onConfigClose}
                    hudConfig={hudConfig}
                    setHudConfig={setHudConfig}
                    tieneSuscripcionAvanzada={tieneSuscripcionAvanzada}
                  />

                  {/* TABLA HUD PROFESIONAL con configuración personalizada */}
                  <Box 
                    overflowX="auto" 
                    bg={useColorModeValue("gray.100", "gray.900")}
                    p={{ base: 1, md: 2 }}
                    borderRadius="md"
                  >
                    <Grid 
                      templateColumns={{ base: "repeat(6, 1fr)", md: "repeat(8, 1fr)", lg: "repeat(10, 1fr)" }}
                      gap={{ base: "2px", md: "3px" }}
                      fontSize="2xs"
                    >
                      {/* Renderizar secciones basadas en la configuración */}
                      {Object.entries({
                        preflop: { title: "PREFLOP", icon: FaHandPaper },
                        postflop: { title: "POSTFLOP", icon: FaChartPie },
                        flop: { title: "FLOP", icon: FaWater },
                        turn: { title: "TURN", icon: FaSyncAlt },
                        river: { title: "RIVER", icon: FaTrophy },
                        showdown: { title: "SHOWDOWN ADVANCED", icon: FaMedal }
                      }).map(([section, { title, icon }]) => {
                        const visibleStats = getVisibleOrderedStats(section);
                        if (visibleStats.length === 0) return null;
                        
                        return (
                          <HUDSection key={section} title={title} icon={icon}>
                            {visibleStats.map(stat => {
                              const value = jugador[stat.dbField];
                              const displayValue = value !== undefined && value !== null
                                ? typeof value === 'number' ? `${value}%` : value
                                : '0%';
                              
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

                  {/* Información de selección y botón copiar */}
                  <Box mt={3} px={{ base: 1, md: 2 }}>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="xs" color={subtextColor}>
                        {Object.keys(selectedStats).length} stats seleccionadas
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
                      isDisabled={Object.keys(selectedStats).length === 0}
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
                </Box>
                
                {/* Gráfico de ganancias */}
                {tieneSuscripcionAvanzada && (
                  <Box 
                    mt={6} 
                    p={6} 
                    bg={cardBg} 
                    borderRadius="xl" 
                    boxShadow="base"
                    position="relative"
                    overflow="hidden"
                  >
                    <Box 
                      position="absolute" 
                      top="-10%" 
                      right="-5%" 
                      w="200px" 
                      h="200px" 
                      bgGradient={mainGradient}
                      opacity="0.05"
                      borderRadius="full"
                      zIndex={0}
                    />
                    
                    <HStack mb={4} position="relative" zIndex={1}>
                      <Heading size="md" color={textColor}>
                        Evolución de Ganancias
                      </Heading>
                      <Badge 
                        bg={brand.primary}
                        color="white" 
                        fontSize="md"
                      >
                        {jugador.player_name}
                      </Badge>
                    </HStack>
                    
                    <Box position="relative" zIndex={1} minH="400px" w="100%">
                      <GraficoGanancias 
                        nombre={jugador.player_name} 
                        salaSeleccionada={salaSeleccionada}
                        tipoPeriodo={tipoPeriodo}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;