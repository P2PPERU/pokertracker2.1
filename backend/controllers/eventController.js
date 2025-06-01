const { EventLogger, EVENT_TYPES } = require('../utils/eventLogger');
const EventModel = require('../models/eventModel');

const EventController = {
  // Crear un evento manualmente (para testing)
  createEvent: async (req, res) => {
    try {
      const { user_id, event_type, event_data } = req.body;

      if (!user_id || !event_type) {
        return res.status(400).json({
          error: 'user_id y event_type son requeridos'
        });
      }

      const event = await EventLogger.log(user_id, event_type, event_data, req);
      
      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        event
      });

    } catch (error) {
      console.error('Error creando evento:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Obtener eventos de un usuario
  getUserEvents: async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;

      const events = await EventModel.getByUser(userId, parseInt(limit));
      
      res.json({
        success: true,
        events,
        total: events.length
      });

    } catch (error) {
      console.error('Error obteniendo eventos del usuario:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Obtener eventos por tipo y rango de fechas
  getEventsByType: async (req, res) => {
    try {
      const { eventType } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'startDate y endDate son requeridos'
        });
      }

      const events = await EventModel.getByTypeAndDate(eventType, startDate, endDate);
      const count = await EventModel.countByType(eventType, startDate, endDate);
      
      res.json({
        success: true,
        event_type: eventType,
        date_range: { startDate, endDate },
        events,
        total_count: count
      });

    } catch (error) {
      console.error('Error obteniendo eventos por tipo:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Obtener estadísticas de eventos
  getEventStats: async (req, res) => {
    try {
      const { days = 7 } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const stats = {};
      
      // Contar cada tipo de evento
      for (const [key, eventType] of Object.entries(EVENT_TYPES)) {
        const count = await EventModel.countByType(
          eventType, 
          startDate.toISOString(), 
          endDate.toISOString()
        );
        stats[eventType] = count;
      }

      res.json({
        success: true,
        period: `Últimos ${days} días`,
        date_range: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        stats
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de eventos:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Limpiar eventos antiguos (para mantenimiento)
  cleanOldEvents: async (req, res) => {
    try {
      const { days = 90 } = req.query;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      const query = `
        DELETE FROM user_events 
        WHERE created_at < $1
      `;
      
      const result = await pool.query(query, [cutoffDate.toISOString()]);
      
      res.json({
        success: true,
        message: `Eventos anteriores a ${cutoffDate.toISOString().split('T')[0]} eliminados`,
        deleted_count: result.rowCount
      });

    } catch (error) {
      console.error('Error limpiando eventos antiguos:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
};

module.exports = EventController;