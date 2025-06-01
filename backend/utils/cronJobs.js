const cron = require('node-cron');
const MetricsCalculator = require('./metricsCalculator');

const CronJobs = {
  // Job para calcular métricas diarias a las 23:30
  startDailyMetricsJob: () => {
    cron.schedule('30 23 * * *', async () => {
      try {
        console.log('🕐 Ejecutando cálculo automático de métricas diarias...');
        
        const today = new Date().toISOString().split('T')[0];
        const metrics = await MetricsCalculator.calculateDailyMetrics(today);
        
        console.log(`✅ Métricas diarias calculadas automáticamente para ${today}`);
        console.log(`💰 MRR: $${metrics.mrr}`);
        console.log(`👥 Total usuarios: ${metrics.total_users}`);
        console.log(`🎯 Usuarios activos: ${metrics.active_users_7d}`);
        
      } catch (error) {
        console.error('❌ Error en cálculo automático de métricas:', error);
      }
    });
    
    console.log('⏰ Job de métricas diarias programado para las 23:30');
  },

  // Job para limpiar eventos antiguos (cada domingo a las 02:00)
  startCleanupJob: () => {
    cron.schedule('0 2 * * 0', async () => {
      try {
        console.log('🧹 Ejecutando limpieza de eventos antiguos...');
        
        const pool = require('../config/db');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90); // Eventos mayores a 90 días
        
        const query = `
          DELETE FROM user_events 
          WHERE created_at < $1
        `;
        
        const result = await pool.query(query, [cutoffDate.toISOString()]);
        
        console.log(`✅ Limpieza completada. ${result.rowCount} eventos eliminados.`);
        
      } catch (error) {
        console.error('❌ Error en limpieza automática:', error);
      }
    });
    
    console.log('🧹 Job de limpieza programado para domingos a las 02:00');
  },

  // Job para verificar y alertar sobre métricas críticas (cada hora)
  startAlertsJob: () => {
    cron.schedule('0 * * * *', async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        const growthData = await MetricsCalculator.getGrowthMetrics(today);
        
        // Alertas críticas
        if (growthData.growth) {
          // Si MRR baja más del 10%
          if (growthData.growth.mrr < -10) {
            console.log('🚨 ALERTA: MRR bajó más del 10%');
          }
          
          // Si usuarios activos bajan más del 20%
          if (growthData.growth.active_users_7d < -20) {
            console.log('🚨 ALERTA: Usuarios activos bajaron más del 20%');
          }
          
          // Si conversión baja más del 15%
          if (growthData.growth.conversion_rate < -15) {
            console.log('🚨 ALERTA: Tasa de conversión bajó más del 15%');
          }
        }
        
      } catch (error) {
        // Silenciar errores para no spamear logs
      }
    });
    
    console.log('🚨 Job de alertas programado cada hora');
  },

  // Inicializar todos los jobs
  initializeAllJobs: () => {
    CronJobs.startDailyMetricsJob();
    CronJobs.startCleanupJob();
    CronJobs.startAlertsJob();
    
    console.log('🚀 Todos los cron jobs iniciados exitosamente');
  }
};

module.exports = CronJobs;