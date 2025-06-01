import { useState, useEffect } from 'react';
import api from '../../services/api';

export const useAdminMetrics = () => {
  const [metrics, setMetrics] = useState({
    financial: {
      mrr: 0,
      totalRevenue: 0,
      revenueByPlan: { oro: 0, plata: 0 },
      mrrGrowth: 0,
      arpu: 0
    },
    users: {
      churnRate: 0,
      retentionRate: 0,
      conversionRate: 0,
      activeUsers: 0,
      upgradeRate: 0,
      total_users: 0,
      new_registrations: 0,
      paid_users: 0
    },
    usage: {
      player_searches: 0,
      ai_analyses: 0,
      avg_searches_per_user: 0
    },
    growth: {}
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Obtener métricas del dashboard
      const dashboardResponse = await api.get('/admin/metrics-dashboard');
      const dashboardData = dashboardResponse.data;
      
      if (dashboardData.success) {
        const currentMetrics = dashboardData.metrics;
        const growthData = dashboardData.growth || {};
        
        // Transformar datos para el formato esperado
        setMetrics({
          financial: {
            mrr: currentMetrics.mrr || 0,
            totalRevenue: (currentMetrics.mrr || 0) * 12,
            revenueByPlan: {
              oro: Math.round((currentMetrics.paid_users || 0) * 0.4 * 19.99), // Estimación
              plata: Math.round((currentMetrics.paid_users || 0) * 0.6 * 11.99)
            },
            mrrGrowth: growthData.mrr || 0,
            arpu: currentMetrics.total_users > 0 ? 
              (currentMetrics.mrr / currentMetrics.total_users) : 0
          },
          users: {
            total_users: currentMetrics.total_users || 0,
            new_registrations: currentMetrics.new_registrations || 0,
            paid_users: currentMetrics.paid_users || 0,
            activeUsers: currentMetrics.active_users_7d || 0,
            conversionRate: (currentMetrics.conversion_rate || 0) * 100,
            churnRate: Math.max(0, 100 - ((currentMetrics.active_users_7d || 0) / (currentMetrics.total_users || 1)) * 100),
            retentionRate: ((currentMetrics.active_users_7d || 0) / (currentMetrics.total_users || 1)) * 100,
            upgradeRate: growthData.paid_users || 0
          },
          usage: {
            player_searches: currentMetrics.player_searches || 0,
            ai_analyses: currentMetrics.ai_analyses || 0,
            avg_searches_per_user: currentMetrics.avg_searches_per_user || 0
          },
          growth: growthData
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    await fetchMetrics();
  };

  const calculateMetrics = async (date = null) => {
    try {
      await api.post('/admin/calculate-metrics', { date });
      await fetchMetrics(); // Recargar después de calcular
      return { success: true };
    } catch (err) {
      console.error('Error calculating metrics:', err);
      return { success: false, error: err.message };
    }
  };

  return { 
    metrics, 
    loading, 
    error, 
    refreshMetrics, 
    calculateMetrics 
  };
};