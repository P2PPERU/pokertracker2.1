const pool = require('../config/db');
const EventModel = require('../models/eventModel');
const MetricModel = require('../models/metricModel');

const MetricsCalculator = {
  // Calcular todas las métricas para una fecha específica
  calculateDailyMetrics: async (date = new Date().toISOString().split('T')[0]) => {
    try {
      console.log(`🔄 Calculando métricas para ${date}...`);

      // 1. Total de usuarios registrados hasta la fecha
      const totalUsersQuery = `
        SELECT COUNT(*) as count 
        FROM usuarios 
        WHERE DATE(created_at) <= $1
      `;
      const totalUsersResult = await pool.query(totalUsersQuery, [date]);
      const total_users = parseInt(totalUsersResult.rows[0].count);

      // 2. Nuevos registros del día
      const newRegistrationsQuery = `
        SELECT COUNT(*) as count 
        FROM usuarios 
        WHERE DATE(created_at) = $1
      `;
      const newRegistrationsResult = await pool.query(newRegistrationsQuery, [date]);
      const new_registrations = parseInt(newRegistrationsResult.rows[0].count);

      // 3. Usuarios activos (últimos 7 días)
      const activeUsers7dQuery = `
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_events 
        WHERE event_type = 'user_login' 
        AND DATE(created_at) BETWEEN $1::date - INTERVAL '6 days' AND $1::date
      `;
      const activeUsers7dResult = await pool.query(activeUsers7dQuery, [date]);
      const active_users_7d = parseInt(activeUsers7dResult.rows[0].count);

      // 4. Usuarios activos (últimos 30 días)
      const activeUsers30dQuery = `
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_events 
        WHERE event_type = 'user_login' 
        AND DATE(created_at) BETWEEN $1::date - INTERVAL '29 days' AND $1::date
      `;
      const activeUsers30dResult = await pool.query(activeUsers30dQuery, [date]);
      const active_users_30d = parseInt(activeUsers30dResult.rows[0].count);

      // 5. Usuarios con suscripción activa
      const paidUsersQuery = `
        SELECT COUNT(*) as count 
        FROM usuarios 
        WHERE suscripcion IN ('plata', 'oro') 
        AND (suscripcion_expira IS NULL OR suscripcion_expira > $1::date)
      `;
      const paidUsersResult = await pool.query(paidUsersQuery, [date]);
      const paid_users = parseInt(paidUsersResult.rows[0].count);

      // 6. MRR (Monthly Recurring Revenue)
      const mrr = paid_users * 11.99;

      // 7. Búsquedas de jugadores del día
      const player_searches = await EventModel.countByType(
        'player_search', 
        `${date} 00:00:00`, 
        `${date} 23:59:59`
      );

      // 8. Análisis IA solicitados del día
      const ai_analyses = await EventModel.countByType(
        'ai_analysis_requested', 
        `${date} 00:00:00`, 
        `${date} 23:59:59`
      );

      // 9. Nuevas suscripciones del día
      const new_subscriptions = await EventModel.countByType(
        'subscription_activated', 
        `${date} 00:00:00`, 
        `${date} 23:59:59`
      );

      // 10. Suscripciones canceladas del día
      const cancelled_subscriptions = await EventModel.countByType(
        'subscription_cancelled', 
        `${date} 00:00:00`, 
        `${date} 23:59:59`
      );

      // 11. Promedio de búsquedas por usuario activo
      const avg_searches_per_user = active_users_7d > 0 ? 
        (player_searches / active_users_7d) : 0;

      // 12. Tasa de conversión (usuarios pagados / total usuarios)
      const conversion_rate = total_users > 0 ? 
        (paid_users / total_users) : 0;

      // Guardar métricas calculadas
      const metricsData = {
        date,
        total_users,
        new_registrations,
        active_users_7d,
        active_users_30d,
        paid_users,
        mrr: parseFloat(mrr.toFixed(2)),
        player_searches,
        ai_analyses,
        new_subscriptions,
        cancelled_subscriptions,
        avg_searches_per_user: parseFloat(avg_searches_per_user.toFixed(2)),
        conversion_rate: parseFloat(conversion_rate.toFixed(4))
      };

      const savedMetrics = await MetricModel.upsert(metricsData);
      
      console.log(`✅ Métricas calculadas para ${date}:`, {
        total_users,
        paid_users,
        mrr: `$${mrr.toFixed(2)}`,
        conversion_rate: `${(conversion_rate * 100).toFixed(2)}%`
      });

      return savedMetrics;

    } catch (error) {
      console.error('❌ Error calculando métricas:', error);
      throw error;
    }
  },

  // Calcular métricas de los últimos N días
  calculateLastNDays: async (days = 7) => {
    const results = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      try {
        const metrics = await MetricsCalculator.calculateDailyMetrics(dateString);
        results.push(metrics);
      } catch (error) {
        console.error(`Error calculando métricas para ${dateString}:`, error);
      }
    }
    
    return results;
  },

  // Obtener comparación con período anterior
  getGrowthMetrics: async (currentDate = new Date().toISOString().split('T')[0]) => {
    try {
      // Fecha anterior (hace 7 días)
      const previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 7);
      const previousDateString = previousDate.toISOString().split('T')[0];

      // Obtener métricas actuales y anteriores
      const current = await MetricModel.getByDate(currentDate);
      const previous = await MetricModel.getByDate(previousDateString);

      if (!current || !previous) {
        return { error: 'Datos insuficientes para comparación' };
      }

      // Calcular crecimientos
      const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        current_date: currentDate,
        previous_date: previousDateString,
        growth: {
          total_users: calculateGrowth(current.total_users, previous.total_users),
          paid_users: calculateGrowth(current.paid_users, previous.paid_users),
          mrr: calculateGrowth(current.mrr, previous.mrr),
          active_users_7d: calculateGrowth(current.active_users_7d, previous.active_users_7d),
          player_searches: calculateGrowth(current.player_searches, previous.player_searches),
          ai_analyses: calculateGrowth(current.ai_analyses, previous.ai_analyses),
          conversion_rate: calculateGrowth(current.conversion_rate, previous.conversion_rate)
        },
        current_metrics: current,
        previous_metrics: previous
      };

    } catch (error) {
      console.error('❌ Error calculando crecimiento:', error);
      throw error;
    }
  }
};

module.exports = MetricsCalculator;