const MetricsCalculator = require('../utils/metricsCalculator');
const MetricModel = require('../models/metricModel');

const MetricController = {
  // Calcular métricas manualmente para una fecha
  calculateMetrics: async (req, res) => {
    try {
      const { date } = req.body;
      const targetDate = date || new Date().toISOString().split('T')[0];

      console.log(`🔄 Calculando métricas para ${targetDate}...`);
      
      const metrics = await MetricsCalculator.calculateDailyMetrics(targetDate);
      
      res.json({
        success: true,
        message: `Métricas calculadas para ${targetDate}`,
        metrics
      });

    } catch (error) {
      console.error('Error calculando métricas:', error);
      res.status(500).json({
        error: 'Error calculando métricas',
        details: error.message
      });
    }
  },

  // Obtener métricas del dashboard principal
  getDashboardMetrics: async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Obtener métricas de hoy
      let todayMetrics = await MetricModel.getByDate(today);
      
      // Si no existen métricas para hoy, calcularlas
      if (!todayMetrics) {
        console.log('📊 No hay métricas para hoy, calculando...');
        todayMetrics = await MetricsCalculator.calculateDailyMetrics(today);
      }

      // Obtener comparación con crecimiento
      const growthData = await MetricsCalculator.getGrowthMetrics(today);

      res.json({
        success: true,
        date: today,
        metrics: todayMetrics,
        growth: growthData.growth || {},
        comparison: {
          current: growthData.current_metrics,
          previous: growthData.previous_metrics
        }
      });

    } catch (error) {
      console.error('Error obteniendo métricas del dashboard:', error);
      res.status(500).json({
        error: 'Error obteniendo métricas del dashboard',
        details: error.message
      });
    }
  },

  // Obtener métricas históricas
  getHistoricalMetrics: async (req, res) => {
    try {
      const { days = 30 } = req.query;
      
      const metrics = await MetricModel.getLastNDays(parseInt(days));
      
      // Calcular tendencias
      const trends = {};
      if (metrics.length >= 2) {
        const latest = metrics[0];
        const previous = metrics[1];
        
        trends.mrr_trend = latest.mrr > previous.mrr ? 'up' : 'down';
        trends.users_trend = latest.total_users > previous.total_users ? 'up' : 'down';
        trends.activity_trend = latest.active_users_7d > previous.active_users_7d ? 'up' : 'down';
      }

      res.json({
        success: true,
        period: `Últimos ${days} días`,
        metrics,
        trends,
        summary: {
          total_records: metrics.length,
          date_range: {
            from: metrics[metrics.length - 1]?.date,
            to: metrics[0]?.date
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo métricas históricas:', error);
      res.status(500).json({
        error: 'Error obteniendo métricas históricas',
        details: error.message
      });
    }
  },

  // Obtener métricas financieras específicas
  getFinancialMetrics: async (req, res) => {
    try {
      const { period = 30 } = req.query;
      
      const metrics = await MetricModel.getLastNDays(parseInt(period));
      
      // Calcular métricas financieras avanzadas
      const financialData = {
        current_mrr: metrics[0]?.mrr || 0,
        avg_mrr: 0,
        mrr_growth: 0,
        total_revenue_projection: 0,
        paid_user_percentage: 0,
        avg_revenue_per_user: 0
      };

      if (metrics.length > 0) {
        // MRR promedio del período
        const totalMrr = metrics.reduce((sum, m) => sum + parseFloat(m.mrr), 0);
        financialData.avg_mrr = parseFloat((totalMrr / metrics.length).toFixed(2));
        
        // Crecimiento de MRR
        if (metrics.length >= 2) {
          const oldMrr = metrics[metrics.length - 1].mrr;
          const newMrr = metrics[0].mrr;
          financialData.mrr_growth = oldMrr > 0 ? 
            parseFloat(((newMrr - oldMrr) / oldMrr * 100).toFixed(2)) : 0;
        }
        
        // Proyección anual
        financialData.total_revenue_projection = parseFloat((metrics[0].mrr * 12).toFixed(2));
        
        // Porcentaje de usuarios pagados
        const latest = metrics[0];
        financialData.paid_user_percentage = latest.total_users > 0 ? 
          parseFloat((latest.paid_users / latest.total_users * 100).toFixed(2)) : 0;
        
        // Ingreso promedio por usuario total
        financialData.avg_revenue_per_user = latest.total_users > 0 ? 
          parseFloat((latest.mrr / latest.total_users).toFixed(2)) : 0;
      }

      res.json({
        success: true,
        period: `Últimos ${period} días`,
        financial_metrics: financialData,
        historical_data: metrics
      });

    } catch (error) {
      console.error('Error obteniendo métricas financieras:', error);
      res.status(500).json({
        error: 'Error obteniendo métricas financieras',
        details: error.message
      });
    }
  },

  // Forzar recálculo de todas las métricas
  recalculateAllMetrics: async (req, res) => {
    try {
      const { days = 7 } = req.body;
      
      console.log(`🔄 Recalculando métricas de los últimos ${days} días...`);
      
      const results = await MetricsCalculator.calculateLastNDays(parseInt(days));
      
      res.json({
        success: true,
        message: `Métricas recalculadas para los últimos ${days} días`,
        results,
        total_processed: results.length
      });

    } catch (error) {
      console.error('Error recalculando métricas:', error);
      res.status(500).json({
        error: 'Error recalculando métricas',
        details: error.message
      });
    }
  }
};

module.exports = MetricController;