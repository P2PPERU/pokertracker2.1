// frontend/src/hooks/useStatColor.js
import { useMemo } from 'react';
import { useColorModeValue } from '@chakra-ui/react';
import { getStatColor, getMoneyColor, statThresholds } from '../theme/colors';

/**
 * Hook personalizado para obtener colores de estadísticas
 * @param {string} statName - Nombre de la estadística (ej: 'VPIP', 'PFR')
 * @param {string|number} value - Valor de la estadística
 * @returns {Object} Objeto con colores y estados
 */
export const useStatColor = (statName, value) => {
  // Colores base según el modo
  const defaultColor = useColorModeValue('gray.600', 'gray.400');
  const optimalBg = useColorModeValue('green.50', 'green.900');
  const warningBg = useColorModeValue('orange.50', 'orange.900');
  const dangerBg = useColorModeValue('red.50', 'red.900');
  
  const result = useMemo(() => {
    // Si no hay valor, retornar colores por defecto
    if (value === undefined || value === null || value === '') {
      return {
        color: defaultColor,
        bgColor: 'transparent',
        isOptimal: false,
        isWarning: false,
        isDanger: false,
        threshold: null,
      };
    }
    
    // Obtener el color basado en los umbrales
    const statColor = getStatColor(statName, value);
    const threshold = statThresholds[statName];
    
    // Determinar estados
    const isOptimal = statColor === '#10B981';
    const isWarning = statColor === '#F59E0B';
    const isDanger = statColor === '#EF4444';
    
    // Determinar color de fondo según el estado
    let bgColor = 'transparent';
    if (isOptimal) bgColor = optimalBg;
    else if (isWarning) bgColor = warningBg;
    else if (isDanger) bgColor = dangerBg;
    
    return {
      color: statColor,
      bgColor,
      isOptimal,
      isWarning,
      isDanger,
      threshold,
    };
  }, [statName, value, defaultColor, optimalBg, warningBg, dangerBg]);
  
  return result;
};

/**
 * Hook para obtener color de valores monetarios
 * @param {string|number} value - Valor monetario
 * @returns {Object} Objeto con color e información
 */
export const useMoneyColor = (value) => {
  const profitColor = useColorModeValue('green.600', 'green.400');
  const lossColor = useColorModeValue('red.600', 'red.400');
  const breakevenColor = useColorModeValue('gray.600', 'gray.400');
  
  const result = useMemo(() => {
    const color = getMoneyColor(value);
    const numValue = parseFloat(value) || 0;
    
    // Mapear el color hexadecimal a los colores del tema
    let themeColor = breakevenColor;
    if (color === '#10B981') themeColor = profitColor;
    else if (color === '#EF4444') themeColor = lossColor;
    
    return {
      color: themeColor,
      isProfit: numValue > 0,
      isLoss: numValue < 0,
      isBreakeven: numValue === 0,
      value: numValue,
    };
  }, [value, profitColor, lossColor, breakevenColor]);
  
  return result;
};

/**
 * Hook para obtener información de umbrales de una estadística
 * @param {string} statName - Nombre de la estadística
 * @returns {Object} Información de umbrales y descripción
 */
export const useStatThreshold = (statName) => {
  const threshold = statThresholds[statName];
  
  const description = useMemo(() => {
    if (!threshold) return null;
    
    // Descripciones personalizadas para cada estadística
    const descriptions = {
      'VPIP': 'Voluntarily Put money In Pot - % de veces que invierte voluntariamente preflop',
      'PFR': 'PreFlop Raise - % de veces que sube preflop',
      '3 BET': '% de veces que hace 3-bet cuando tiene oportunidad',
      'Fold to 3-BET': '% de veces que foldea ante un 3-bet después de haber abierto',
      'Fold to 4-Bet': '% de veces que foldea ante un 4-bet después de hacer 3-bet',
      'CBet Flop': 'Continuation Bet - % de veces que apuesta en el flop siendo el agresor preflop',
      'CBet Turn': '% de veces que continúa apostando en el turn después de cbettear flop',
      'WWSF': 'Won When Saw Flop - % de veces que gana cuando ve el flop',
      'WTSD': 'Went To ShowDown - % de veces que llega al showdown cuando ve el flop',
      'WSD': 'Won ShowDown - % de veces que gana en el showdown',
      'Limp %': '% de veces que hace limp (solo paga la ciega grande) preflop',
      'Limp-Raise %': '% de veces que sube después de hacer limp',
      'Fold to Flop CBet': '% de veces que foldea ante una continuation bet en el flop',
      'Fold to Turn CBet': '% de veces que foldea ante una continuation bet en el turn',
      'Probe Bet Turn %': '% de veces que apuesta en el turn cuando el agresor no apostó en el flop',
      'Bet River %': '% de veces que apuesta en el river',
      'Fold to River Bet': '% de veces que foldea ante una apuesta en el river',
      'Overbet Turn %': '% de veces que apuesta más del tamaño del pozo en el turn',
      'Overbet River %': '% de veces que apuesta más del tamaño del pozo en el river',
      'WSDwBR %': 'Won ShowDown when Bet River - % de veces que gana cuando apuesta river y va a showdown',
    };
    
    return descriptions[statName] || `Estadística de ${statName}`;
  }, [statName]);
  
  const optimalRange = useMemo(() => {
    if (!threshold || !threshold.optimal) return null;
    
    return `${threshold.optimal.min}-${threshold.optimal.max}%`;
  }, [threshold]);
  
  return {
    threshold,
    description,
    optimalRange,
    hasThreshold: !!threshold,
  };
};

/**
 * Hook para obtener todos los colores de estadísticas de un jugador
 * @param {Object} jugador - Objeto con todas las estadísticas del jugador
 * @returns {Object} Mapa de estadística -> información de color
 */
export const usePlayerStatColors = (jugador) => {
  const statsToCheck = [
    { key: 'vpip', name: 'VPIP' },
    { key: 'pfr', name: 'PFR' },
    { key: 'three_bet', name: '3 BET' },
    { key: 'fold_to_3bet_pct', name: 'Fold to 3-BET' },
    { key: 'fold_to_4bet_pct', name: 'Fold to 4-Bet' },
    { key: 'cbet_flop', name: 'CBet Flop' },
    { key: 'cbet_turn', name: 'CBet Turn' },
    { key: 'wwsf', name: 'WWSF' },
    { key: 'wtsd', name: 'WTSD' },
    { key: 'wsd', name: 'WSD' },
    { key: 'limp_pct', name: 'Limp %' },
    { key: 'limp_raise_pct', name: 'Limp-Raise %' },
    { key: 'fold_to_flop_cbet_pct', name: 'Fold to Flop CBet' },
    { key: 'fold_to_turn_cbet_pct', name: 'Fold to Turn CBet' },
    { key: 'probe_bet_turn_pct', name: 'Probe Bet Turn %' },
    { key: 'bet_river_pct', name: 'Bet River %' },
    { key: 'fold_to_river_bet_pct', name: 'Fold to River Bet' },
    { key: 'overbet_turn_pct', name: 'Overbet Turn %' },
    { key: 'overbet_river_pct', name: 'Overbet River %' },
    { key: 'wsdwbr_pct', name: 'WSDwBR %' },
  ];
  
  const colors = useMemo(() => {
    if (!jugador) return {};
    
    const result = {};
    
    // Procesar cada estadística
    statsToCheck.forEach(({ key, name }) => {
      if (jugador[key] !== undefined) {
        result[name] = useStatColor(name, jugador[key]);
      }
    });
    
    // Agregar colores para valores monetarios
    if (jugador.bb_100 !== undefined) {
      result['WINRATE'] = useMoneyColor(jugador.bb_100);
    }
    if (jugador.win_usd !== undefined) {
      result['Ganancias USD'] = useMoneyColor(jugador.win_usd);
    }
    
    return result;
  }, [jugador]);
  
  return colors;
};