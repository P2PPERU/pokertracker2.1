// frontend/src/hooks/dashboard/usePlayerSearch.js

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import _ from 'lodash';

export const usePlayerSearch = (initialPlayer = "LALIGAMANAGER") => {
  const { auth } = useAuth();
  const toast = useToast();
  
  // Estados
  const [jugador, setJugador] = useState(null);
  const [nombreBuscado, setNombreBuscado] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [salaSeleccionada, setSalaSeleccionada] = useState("XPK");
  const [tipoPeriodo, setTipoPeriodo] = useState("total");
  const [esFavorito, setEsFavorito] = useState(false);
  
  // Estados para multi-stake
  const [stakesDisponibles, setStakesDisponibles] = useState([]);
  const [stakeSeleccionado, setStakeSeleccionado] = useState(null);
  const [loadingStakes, setLoadingStakes] = useState(false);
  
  const sugerenciasRef = useRef(null);

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
    }
  }, [stakesDisponibles]);

  // Alternar favorito
  const toggleFavorito = useCallback(async () => {
    if (!jugador || !auth?.token) return;
  
    try {
      if (esFavorito) {
        await api.delete(`/favoritos/${salaSeleccionada}/${encodeURIComponent(jugador.player_name)}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setEsFavorito(false);
      } else {
        await api.post(
          "/favoritos",
          { player_name: jugador.player_name, sala: salaSeleccionada },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        setEsFavorito(true);
      }
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
    }
  }, [jugador, auth?.token, esFavorito, salaSeleccionada]);

  // Buscar jugador inicial
  useEffect(() => {
    if (initialPlayer) {
      buscarJugador(initialPlayer);
    }
  }, [initialPlayer]);

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

  return {
    // Estados
    jugador,
    nombreBuscado,
    sugerencias,
    loading,
    mostrarSugerencias,
    salaSeleccionada,
    tipoPeriodo,
    esFavorito,
    stakesDisponibles,
    stakeSeleccionado,
    loadingStakes,
    
    // Refs
    sugerenciasRef,
    
    // Funciones
    handleInputChange,
    setNombreBuscado,
    buscarJugador,
    setSalaSeleccionada,
    setTipoPeriodo,
    setMostrarSugerencias,
    cambiarStake,
    toggleFavorito,
  };
};