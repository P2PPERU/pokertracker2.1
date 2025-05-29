// frontend/src/theme/colors.js

// 🎨 COLORES PRINCIPALES DE LA MARCA
export const brand = {
  primary: '#4066ED',      // Azul profundo - Color principal
  secondary: '#6CB5FE',    // Azul cielo - Color secundario
  accent: '#14B8A6',       // Teal - Para CTAs importantes
  gradient: 'linear(to-r, #6CB5FE, #4066ED)', // Gradiente principal
};

// 🌓 COLORES DE FONDO
export const backgrounds = {
  light: {
    page: '#F5F8FC',       // Fondo de página
    card: '#FFFFFF',       // Fondo de tarjetas
    hover: '#F1F5F9',      // Hover en elementos
    modal: '#FFFFFF',      // Fondo de modales
  },
  dark: {
    page: '#0F172A',       // Fondo de página oscuro
    card: '#1E293B',       // Fondo de tarjetas oscuro
    hover: '#334155',      // Hover en elementos oscuro
    modal: '#1E293B',      // Fondo de modales oscuro
  }
};

// 📊 COLORES PARA ESTADÍSTICAS
export const stats = {
  optimal: '#10B981',      // Verde esmeralda - Valores óptimos
  good: '#3B82F6',        // Azul - Valores buenos
  neutral: '#6B7280',     // Gris - Valores neutrales
  warning: '#F59E0B',     // Ámbar - Valores de precaución
  danger: '#EF4444',      // Rojo - Valores problemáticos
};

// 🃏 COLORES TEMÁTICOS DE POKER
export const poker = {
  gold: '#FCD34D',        // Suscripción Oro
  silver: '#CBD5E1',      // Suscripción Plata
  bronze: '#FB923C',      // Suscripción Bronce
  chips: '#1E293B',       // Color de fichas
  felt: '#065F46',        // Verde de mesa de poker
};

// 💰 COLORES PARA VALORES MONETARIOS
export const money = {
  profit: '#10B981',      // Verde - Ganancias
  loss: '#EF4444',        // Rojo - Pérdidas
  breakeven: '#6B7280',   // Gris - Sin ganancia/pérdida
};

// 🎯 COLORES DE ESTADO
export const status = {
  success: '#10B981',     // Verde - Éxito
  error: '#EF4444',       // Rojo - Error
  warning: '#F59E0B',     // Ámbar - Advertencia
  info: '#3B82F6',        // Azul - Información
};

// 🎨 GRADIENTES ADICIONALES
export const gradients = {
  main: 'linear(to-r, #6CB5FE, #4066ED)',          // Principal
  hero: 'linear(to-r, #2BB5E0, #8266D4)',          // Hero sections
  button: 'linear(to-r, #14B8A6, #3B82F6)',        // Botones CTA
  success: 'linear(to-r, #10B981, #059669)',       // Éxito
  danger: 'linear(to-r, #EF4444, #DC2626)',        // Peligro
  gold: 'linear(to-r, #FCD34D, #F59E0B)',          // Oro/Premium
};

// 📏 UMBRALES PARA ESTADÍSTICAS (en porcentaje)
export const statThresholds = {
  VPIP: {
    optimal: { min: 20, max: 26 },
    warning: 30,
    danger: 35,
  },
  PFR: {
    optimal: { min: 17, max: 22 },
    warning: 25,
    danger: 30,
  },
  '3 BET': {
    optimal: { min: 7, max: 10 },
    warning: 12,
    danger: 15,
  },
  'Fold to 3-BET': {
    optimal: { min: 55, max: 65 },
    warning: 70,
    danger: 75,
  },
  'Fold to 4-Bet': {
    optimal: { min: 45, max: 65 },
    warning: 70,
    danger: 75,
  },
  'CBet Flop': {
    optimal: { min: 60, max: 75 },
    warning: 80,
    danger: 85,
  },
  'CBet Turn': {
    optimal: { min: 50, max: 65 },
    warning: 70,
    danger: 75,
  },
  'WWSF': {
    optimal: { min: 42, max: 48 },
    warning: 50,
    danger: 55,
  },
  'WTSD': {
    optimal: { min: 22, max: 32 },
    warning: 35,
    danger: 40,
  },
  'WSD': {
    optimal: { min: 50, max: 55 },
    warning: 45,
    danger: 40,
  },
  'Limp %': {
    optimal: { min: 0, max: 5 },
    warning: 10,
    danger: 15,
  },
  'Limp-Raise %': {
    optimal: { min: 0, max: 3 },
    warning: 5,
    danger: 8,
  },
  'Fold to Flop CBet': {
    optimal: { min: 45, max: 55 },
    warning: 65,
    danger: 75,
  },
  'Fold to Turn CBet': {
    optimal: { min: 50, max: 60 },
    warning: 70,
    danger: 80,
  },
  'Probe Bet Turn %': {
    optimal: { min: 30, max: 45 },
    warning: 50,
    danger: 60,
  },
  'Bet River %': {
    optimal: { min: 30, max: 40 },
    warning: 45,
    danger: 50,
  },
  'Fold to River Bet': {
    optimal: { min: 45, max: 60 },
    warning: 70,
    danger: 80,
  },
  'Overbet Turn %': {
    optimal: { min: 5, max: 15 },
    warning: 20,
    danger: 25,
  },
  'Overbet River %': {
    optimal: { min: 5, max: 15 },
    warning: 20,
    danger: 25,
  },
  'WSDwBR %': {
    optimal: { min: 55, max: 65 },
    warning: 50,
    danger: 45,
  },
};

// 🔧 FUNCIONES HELPER
export const getStatColor = (statName, value) => {
  const threshold = statThresholds[statName];
  if (!threshold) return stats.neutral;
  
  const numValue = parseFloat(value);
  
  // Para estadísticas donde menor es mejor (como Limp %)
  if (threshold.optimal.max < threshold.warning) {
    if (numValue <= threshold.optimal.max) return stats.optimal;
    if (numValue <= threshold.warning) return stats.good;
    if (numValue <= threshold.danger) return stats.warning;
    return stats.danger;
  }
  
  // Para estadísticas normales
  if (numValue >= threshold.optimal.min && numValue <= threshold.optimal.max) {
    return stats.optimal;
  }
  if (numValue >= threshold.danger || (threshold.optimal.min > threshold.danger && numValue <= threshold.danger)) {
    return stats.danger;
  }
  if (numValue >= threshold.warning || (threshold.optimal.min > threshold.warning && numValue <= threshold.warning)) {
    return stats.warning;
  }
  return stats.good;
};

export const getMoneyColor = (value) => {
  const numValue = parseFloat(value);
  if (numValue > 0) return money.profit;
  if (numValue < 0) return money.loss;
  return money.breakeven;
};

export const getSuscripcionColor = (suscripcion) => {
  switch (suscripcion) {
    case 'oro': return poker.gold;
    case 'plata': return poker.silver;
    case 'bronce': return poker.bronze;
    default: return stats.neutral;
  }
};