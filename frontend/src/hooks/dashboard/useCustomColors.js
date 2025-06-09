// frontend/src/hooks/dashboard/useCustomColors.js

import { useState, useCallback, useEffect } from 'react';
import { useColorModeValue } from '@chakra-ui/react';

// Colores predefinidos que el usuario puede elegir - CORREGIDOS PARA CONTRASTE
export const PRESET_COLORS = [
  { 
    name: 'Rojo', 
    value: { light: 'red.600', dark: 'red.400' },
    bg: { light: 'red.50', dark: 'red.900' }
  },
  { 
    name: 'Azul', 
    value: { light: 'blue.600', dark: 'blue.400' },
    bg: { light: 'blue.50', dark: 'blue.900' }
  },
  { 
    name: 'Verde', 
    value: { light: 'green.600', dark: 'green.400' },
    bg: { light: 'green.50', dark: 'green.900' }
  },
  { 
    name: 'Naranja', 
    value: { light: 'orange.600', dark: 'orange.400' },
    bg: { light: 'orange.50', dark: 'orange.900' }
  },
  { 
    name: 'Morado', 
    value: { light: 'purple.600', dark: 'purple.400' },
    bg: { light: 'purple.50', dark: 'purple.900' }
  },
  { 
    name: 'Rosa', 
    value: { light: 'pink.600', dark: 'pink.400' },
    bg: { light: 'pink.50', dark: 'pink.900' }
  },
  { 
    name: 'Amarillo', 
    value: { light: 'yellow.600', dark: 'yellow.300' },
    bg: { light: 'yellow.50', dark: 'yellow.900' }
  },
  { 
    name: 'Cian', 
    value: { light: 'cyan.600', dark: 'cyan.400' },
    bg: { light: 'cyan.50', dark: 'cyan.900' }
  },
  { 
    name: 'Teal', 
    value: { light: 'teal.600', dark: 'teal.400' },
    bg: { light: 'teal.50', dark: 'teal.900' }
  },
  { 
    name: 'Índigo', 
    value: { light: 'indigo.700', dark: 'indigo.300' }, // CORREGIDO: más contraste
    bg: { light: 'indigo.50', dark: 'indigo.900' }
  },
  { 
    name: 'Gris', 
    value: { light: 'gray.700', dark: 'gray.300' },
    bg: { light: 'gray.50', dark: 'gray.900' }
  },
  { 
    name: 'Oro', 
    value: { light: 'yellow.500', dark: 'yellow.200' },
    bg: { light: 'yellow.50', dark: 'yellow.900' }
  },
];

// Configuración por defecto
const DEFAULT_CUSTOM_COLORS = {
  customStats: [], // Stats que tienen color personalizado
  colorMapping: {}, // Mapeo de stat -> color
  globalCustomColor: null, // Color global personalizado (opcional)
  useGlobalColor: false, // Si usar color global para todos los stats personalizados
};

export const useCustomColors = () => {
  const colorMode = useColorModeValue('light', 'dark');
  
  // Estado para configuración de colores personalizados
  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem('customColors');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOM_COLORS;
  });

  // Estado para forzar re-render cuando cambia la configuración
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('customColors', JSON.stringify(customColors));
    // Forzar re-render de todos los componentes que usan este hook
    setUpdateTrigger(prev => prev + 1);
  }, [customColors]);

  // Verificar si una estadística tiene color personalizado
  const hasCustomColor = useCallback((statId) => {
    return customColors.customStats.includes(statId);
  }, [customColors.customStats, updateTrigger]);

  // Obtener el color personalizado de una estadística con contraste correcto
  const getCustomColor = useCallback((statId) => {
    if (!hasCustomColor(statId)) return null;
    
    // Si usa color global, retornarlo
    if (customColors.useGlobalColor && customColors.globalCustomColor) {
      const colorConfig = PRESET_COLORS.find(c => 
        c.value.light === customColors.globalCustomColor || 
        c.value.dark === customColors.globalCustomColor ||
        c.value === customColors.globalCustomColor // backward compatibility
      );
      
      if (colorConfig) {
        return colorMode === 'light' ? colorConfig.value.light : colorConfig.value.dark;
      }
      return customColors.globalCustomColor;
    }
    
    // Retornar color específico del stat con contraste correcto
    const statColor = customColors.colorMapping[statId];
    if (!statColor) return null;
    
    const colorConfig = PRESET_COLORS.find(c => 
      c.value.light === statColor || 
      c.value.dark === statColor ||
      c.value === statColor // backward compatibility
    );
    
    if (colorConfig) {
      return colorMode === 'light' ? colorConfig.value.light : colorConfig.value.dark;
    }
    
    return statColor;
  }, [customColors, hasCustomColor, colorMode, updateTrigger]);

  // Agregar/quitar estadística de la lista de personalizados
  const toggleCustomStat = useCallback((statId) => {
    setCustomColors(prev => {
      const newCustomStats = [...prev.customStats];
      const index = newCustomStats.indexOf(statId);
      
      if (index > -1) {
        // Remover de personalizados
        newCustomStats.splice(index, 1);
        const newColorMapping = { ...prev.colorMapping };
        delete newColorMapping[statId];
        
        return {
          ...prev,
          customStats: newCustomStats,
          colorMapping: newColorMapping
        };
      } else {
        // Agregar a personalizados
        newCustomStats.push(statId);
        return {
          ...prev,
          customStats: newCustomStats
        };
      }
    });
  }, []);

  // Establecer color para una estadística específica
  const setStatColor = useCallback((statId, colorName) => {
    const colorConfig = PRESET_COLORS.find(c => c.name === colorName);
    if (!colorConfig) return;
    
    const colorValue = colorMode === 'light' ? colorConfig.value.light : colorConfig.value.dark;
    
    setCustomColors(prev => ({
      ...prev,
      colorMapping: {
        ...prev.colorMapping,
        [statId]: colorValue
      }
    }));
  }, [colorMode]);

  // Establecer color global
  const setGlobalColor = useCallback((colorName) => {
    const colorConfig = PRESET_COLORS.find(c => c.name === colorName);
    if (!colorConfig) return;
    
    const colorValue = colorMode === 'light' ? colorConfig.value.light : colorConfig.value.dark;
    
    setCustomColors(prev => ({
      ...prev,
      globalCustomColor: colorValue
    }));
  }, [colorMode]);

  // Activar/desactivar uso de color global
  const toggleGlobalColor = useCallback(() => {
    setCustomColors(prev => ({
      ...prev,
      useGlobalColor: !prev.useGlobalColor
    }));
  }, []);

  // Aplicar color a todos los stats personalizados
  const applyColorToAllCustom = useCallback((colorName) => {
    const colorConfig = PRESET_COLORS.find(c => c.name === colorName);
    if (!colorConfig) return;
    
    const colorValue = colorMode === 'light' ? colorConfig.value.light : colorConfig.value.dark;
    
    setCustomColors(prev => {
      const newColorMapping = { ...prev.colorMapping };
      prev.customStats.forEach(statId => {
        newColorMapping[statId] = colorValue;
      });
      
      return {
        ...prev,
        colorMapping: newColorMapping
      };
    });
  }, [colorMode]);

  // Limpiar todas las personalizaciones
  const clearAllCustomizations = useCallback(() => {
    setCustomColors(DEFAULT_CUSTOM_COLORS);
  }, []);

  // Resetear configuración
  const resetConfig = useCallback(() => {
    setCustomColors(DEFAULT_CUSTOM_COLORS);
  }, []);

  // Exportar configuración
  const exportConfig = useCallback(() => {
    return JSON.stringify(customColors, null, 2);
  }, [customColors]);

  // Importar configuración
  const importConfig = useCallback((configJson) => {
    try {
      const config = JSON.parse(configJson);
      setCustomColors(config);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Configuración inválida' };
    }
  }, []);

  // Obtener color para mostrar en el selector (siempre usar la versión light para preview)
  const getColorForDisplay = useCallback((colorName) => {
    const colorConfig = PRESET_COLORS.find(c => c.name === colorName);
    return colorConfig ? colorConfig.value.light : null;
  }, []);

  return {
    // Estado
    customColors,
    
    // Funciones de consulta
    hasCustomColor,
    getCustomColor,
    getColorForDisplay,
    
    // Funciones de modificación
    toggleCustomStat,
    setStatColor,
    setGlobalColor,
    toggleGlobalColor,
    applyColorToAllCustom,
    clearAllCustomizations,
    resetConfig,
    
    // Funciones de import/export
    exportConfig,
    importConfig,
    
    // Datos
    presetColors: PRESET_COLORS,
    customStats: customColors.customStats,
    useGlobalColor: customColors.useGlobalColor,
    globalCustomColor: customColors.globalCustomColor,
    
    // Para debugging
    updateTrigger,
    colorMode,
  };
};