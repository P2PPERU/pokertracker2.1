// frontend/src/utils/dashboard/statsHelpers.js

import { statRanges, STAKE_COLORS, STAKE_LABELS } from '../../constants/dashboard/hudConstants';

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