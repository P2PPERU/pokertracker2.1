// frontend/src/hooks/dashboard/useHUDConfig.js

import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_HUD_CONFIG, ALL_STATS } from '../../constants/dashboard/hudConstants';

export const useHUDConfig = () => {
  // Estado para configuración del HUD
  const [hudConfig, setHudConfig] = useState(() => {
    const savedConfig = localStorage.getItem('hudConfig');
    return savedConfig ? JSON.parse(savedConfig) : DEFAULT_HUD_CONFIG;
  });

  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('hudConfig', JSON.stringify(hudConfig));
  }, [hudConfig]);

  // Actualizar visibilidad de una estadística
  const toggleStatVisibility = useCallback((section, statId) => {
    setHudConfig(prev => {
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
  }, []);

  // Actualizar auto-copy de una estadística
  const toggleAutoCopy = useCallback((statId) => {
    setHudConfig(prev => {
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
  }, []);

  // Actualizar orden de estadísticas
  const updateStatOrder = useCallback((section, newOrder) => {
    setHudConfig(prev => {
      // Obtener todas las stats de la sección
      const allSectionStats = ALL_STATS[section] || [];
      const allStatIds = allSectionStats.map(s => s.id);
      
      // Crear el orden completo manteniendo las stats no visibles al final
      const completeOrder = [...newOrder];
      allStatIds.forEach(id => {
        if (!completeOrder.includes(id)) {
          completeOrder.push(id);
        }
      });
      
      const newConfig = {
        ...prev,
        statOrder: {
          ...prev.statOrder,
          [section]: completeOrder
        }
      };
      // Guardar inmediatamente en localStorage
      localStorage.setItem('hudConfig', JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);

  // Resetear configuración
  const resetConfig = useCallback(() => {
    setHudConfig(DEFAULT_HUD_CONFIG);
  }, []);

  // Obtener stats visibles y ordenadas
  const getVisibleOrderedStats = useCallback((section, tieneSuscripcionAvanzada) => {
    const visibleIds = hudConfig.visibleStats[section] || [];
    const orderedIds = hudConfig.statOrder[section] || [];
    const sectionStats = ALL_STATS[section] || [];
    
    // Crear un mapa para acceso rápido
    const statsMap = {};
    sectionStats.forEach(stat => {
      statsMap[stat.id] = stat;
    });
    
    // Primero incluir las stats en el orden especificado
    const orderedStats = [];
    orderedIds.forEach(id => {
      if (visibleIds.includes(id) && statsMap[id]) {
        const stat = statsMap[id];
        if (!stat.premium || tieneSuscripcionAvanzada) {
          orderedStats.push(stat);
        }
      }
    });
    
    // Luego agregar cualquier stat visible que no esté en el orden
    visibleIds.forEach(id => {
      if (!orderedIds.includes(id) && statsMap[id]) {
        const stat = statsMap[id];
        if (!stat.premium || tieneSuscripcionAvanzada) {
          orderedStats.push(stat);
        }
      }
    });
    
    return orderedStats;
  }, [hudConfig]);

  return {
    hudConfig,
    setHudConfig,
    toggleStatVisibility,
    toggleAutoCopy,
    updateStatOrder,
    resetConfig,
    getVisibleOrderedStats,
  };
};