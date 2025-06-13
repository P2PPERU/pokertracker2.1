// frontend/src/utils/dashboard/statsHelpers.js

import { statRanges, STAKE_COLORS, STAKE_LABELS, FREE_STATS_FOR_BRONZE } from '../../constants/dashboard/hudConstants';

// Función para obtener el color según el valor y el tipo de stat
export const getStatColor = (statType, value) => {
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

// Función helper para obtener color del stake
export const getStakeColor = (stake) => {
  return STAKE_COLORS[stake] || 'gray';
};

// Función helper para obtener label del stake
export const getStakeLabel = (stake) => {
  return STAKE_LABELS[stake] || stake?.toUpperCase() || 'N/A';
};

// Formatear valor de estadística
export const formatStatValue = (value) => {
  if (value === undefined || value === null) return '0%';
  return typeof value === 'number' ? `${value}%` : value;
};

// Validar si el usuario tiene suscripción avanzada
export const hasAdvancedSubscription = (userSubscription) => {
  return ["plata", "oro"].includes(userSubscription);
};

// Obtener color para valores monetarios
export const getMoneyColor = (value) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "gray.500";
  if (numValue > 0) return "green.500";
  if (numValue < 0) return "red.500";
  return "gray.500";
};

// Verificar si una estadística es gratuita para usuarios bronce
export const isStatFreeForBronze = (statId) => {
  return FREE_STATS_FOR_BRONZE.includes(statId);
};

// Verificar si el usuario puede ver una estadística
export const canUserSeeStat = (statId, userSubscription, statConfig) => {
  // Si es una stat gratuita, todos pueden verla
  if (isStatFreeForBronze(statId)) {
    return true;
  }
  
  // Si el usuario tiene suscripción avanzada, puede ver todas
  if (hasAdvancedSubscription(userSubscription)) {
    return true;
  }
  
  // Si la stat es premium y el usuario es bronce, no puede verla
  if (statConfig?.premium) {
    return false;
  }
  
  // Por defecto, permitir
  return true;
};