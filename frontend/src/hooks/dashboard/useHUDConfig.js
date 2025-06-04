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
    setHudConfig(prev => ({
      ...prev,
      statOrder: {
        ...prev.statOrder,
        [section]: newOrder
      }
    }));
  }, []);

  // Resetear configuración
  const resetConfig = useCallback(() => {
    setHudConfig(DEFAULT_HUD_CONFIG);
  }, []);

  // Obtener stats visibles y ordenadas
  const getVisibleOrderedStats = useCallback((section, tieneSuscripcionAvanzada) => {
    const visibleIds = hudConfig.visibleStats[section];
    const orderedIds = hudConfig.statOrder[section];
    
    return orderedIds
      .filter(id => visibleIds.includes(id))
      .map(id => ALL_STATS[section].find(stat => stat.id === id))
      .filter(stat => stat && (!stat.premium || tieneSuscripcionAvanzada));
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