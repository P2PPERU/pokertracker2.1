const pool = require('../config/db');

const MetricModel = {
  // Crear tabla si no existe
  createTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS daily_metrics (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        total_users INTEGER DEFAULT 0,
        new_registrations INTEGER DEFAULT 0,
        active_users_7d INTEGER DEFAULT 0,
        active_users_30d INTEGER DEFAULT 0,
        paid_users INTEGER DEFAULT 0,
        mrr DECIMAL(10,2) DEFAULT 0,
        player_searches INTEGER DEFAULT 0,
        ai_analyses INTEGER DEFAULT 0,
        new_subscriptions INTEGER DEFAULT 0,
        cancelled_subscriptions INTEGER DEFAULT 0,
        avg_searches_per_user DECIMAL(5,2) DEFAULT 0,
        conversion_rate DECIMAL(5,4) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
    `;
    await pool.query(query);
  },

  // Guardar o actualizar métricas del día
  upsert: async (metricsData) => {
    const {
      date,
      total_users,
      new_registrations,
      active_users_7d,
      active_users_30d,
      paid_users,
      mrr,
      player_searches,
      ai_analyses,
      new_subscriptions,
      cancelled_subscriptions,
      avg_searches_per_user,
      conversion_rate
    } = metricsData;

    const query = `
      INSERT INTO daily_metrics (
        date, total_users, new_registrations, active_users_7d, active_users_30d,
        paid_users, mrr, player_searches, ai_analyses, new_subscriptions,
        cancelled_subscriptions, avg_searches_per_user, conversion_rate, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (date) 
      DO UPDATE SET
        total_users = EXCLUDED.total_users,
        new_registrations = EXCLUDED.new_registrations,
        active_users_7d = EXCLUDED.active_users_7d,
        active_users_30d = EXCLUDED.active_users_30d,
        paid_users = EXCLUDED.paid_users,
        mrr = EXCLUDED.mrr,
        player_searches = EXCLUDED.player_searches,
        ai_analyses = EXCLUDED.ai_analyses,
        new_subscriptions = EXCLUDED.new_subscriptions,
        cancelled_subscriptions = EXCLUDED.cancelled_subscriptions,
        avg_searches_per_user = EXCLUDED.avg_searches_per_user,
        conversion_rate = EXCLUDED.conversion_rate,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      date, total_users, new_registrations, active_users_7d, active_users_30d,
      paid_users, mrr, player_searches, ai_analyses, new_subscriptions,
      cancelled_subscriptions, avg_searches_per_user, conversion_rate
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Obtener métricas por fecha
  getByDate: async (date) => {
    const query = 'SELECT * FROM daily_metrics WHERE date = $1';
    const result = await pool.query(query, [date]);
    return result.rows[0];
  },

  // Obtener métricas de últimos N días
  getLastNDays: async (days = 30) => {
    const query = `
      SELECT * FROM daily_metrics 
      WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener comparación de dos fechas
  getComparison: async (date1, date2) => {
    const query = `
      SELECT * FROM daily_metrics 
      WHERE date IN ($1, $2)
      ORDER BY date DESC
    `;
    const result = await pool.query(query, [date1, date2]);
    return result.rows;
  }
};

module.exports = MetricModel;