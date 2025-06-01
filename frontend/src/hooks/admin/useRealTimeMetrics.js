import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export const useRealTimeMetrics = (refreshInterval = 60000) => { // 1 minuto por defecto
  const [metrics, setMetrics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef(null);

  const fetchCurrentMetrics = async () => {
    try {
      const response = await api.get('/admin/metrics-dashboard');
      if (response.data.success) {
        setMetrics(response.data.metrics);
        setLastUpdate(new Date());
        setError(null);
      }
    } catch (err) {
      setError('Error al cargar métricas en tiempo real');
      console.error('Error fetching real-time metrics:', err);
    }
  };

  const fetchRecentEvents = async () => {
    try {
      const response = await api.get('/admin/events-stats?days=1');
      if (response.data.success) {
        setEvents(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const startRealTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(async () => {
      await fetchCurrentMetrics();
      await fetchRecentEvents();
    }, refreshInterval);
  };

  const stopRealTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchCurrentMetrics();
      await fetchRecentEvents();
      setLoading(false);
      startRealTimeUpdates();
    };

    initialize();

    return () => {
      stopRealTimeUpdates();
    };
  }, [refreshInterval]);

  return {
    metrics,
    events,
    loading,
    error,
    lastUpdate,
    refreshMetrics: fetchCurrentMetrics,
    startRealTimeUpdates,
    stopRealTimeUpdates
  };
};