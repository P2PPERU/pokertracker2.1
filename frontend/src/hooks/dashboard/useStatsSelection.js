// frontend/src/hooks/dashboard/useStatsSelection.js

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { statAbbreviations, ALL_STATS } from '../../constants/dashboard/hudConstants';

export const useStatsSelection = (jugador, hudConfig) => {
  const [selectedStats, setSelectedStats] = useState({});
  const [statsText, setStatsText] = useState("");
  const toast = useToast();

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

  // Copiar estadísticas al portapapeles
  const copyStats = useCallback(() => {
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
  }, [selectedStats, toast]);

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedStats({});
  }, []);

  return {
    selectedStats,
    statsText,
    toggleStatSelection,
    copyStats,
    clearSelection,
  };
};