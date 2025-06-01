const pool = require('../config/db');

const EventModel = {
  // Crear tabla si no existe
  createTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS user_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES usuarios(id),
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_user_events_date ON user_events(created_at);
    `;
    await pool.query(query);
  },

  // Guardar evento
  create: async (eventData) => {
    const { user_id, event_type, event_data = {}, ip_address, user_agent } = eventData;
    
    const query = `
      INSERT INTO user_events (user_id, event_type, event_data, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [user_id, event_type, JSON.stringify(event_data), ip_address, user_agent];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Obtener eventos por usuario
  getByUser: async (userId, limit = 50) => {
    const query = `
      SELECT * FROM user_events 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  },

  // Obtener eventos por tipo y fecha
  getByTypeAndDate: async (eventType, startDate, endDate) => {
    const query = `
      SELECT * FROM user_events 
      WHERE event_type = $1 
      AND created_at BETWEEN $2 AND $3
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [eventType, startDate, endDate]);
    return result.rows;
  },

  // Contar eventos por tipo en un rango de fechas
  countByType: async (eventType, startDate, endDate) => {
    const query = `
      SELECT COUNT(*) as count 
      FROM user_events 
      WHERE event_type = $1 
      AND created_at BETWEEN $2 AND $3
    `;
    const result = await pool.query(query, [eventType, startDate, endDate]);
    return parseInt(result.rows[0].count);
  }
};

module.exports = EventModel;