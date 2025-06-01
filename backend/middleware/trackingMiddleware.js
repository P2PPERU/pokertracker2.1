const { EventLogger } = require('../utils/eventLogger');

// Middleware para tracking automático de eventos
const trackingMiddleware = {
  // Trackear login automáticamente
  trackLogin: async (req, res, next) => {
    // Guardar la función original de res.json
    const originalJson = res.json;
    
    res.json = function(data) {
      // Si el login fue exitoso y hay token
      if (data.token && req.user) { // ✅ MANTENER req.user aquí porque se establece en userRoutes.js
        // Trackear el evento de login en segundo plano
        EventLogger.userLogin(req.user.id, req).catch(err => {
          console.error('Error tracking login:', err);
        });
      }
      
      // Llamar a la función original
      return originalJson.call(this, data);
    };
    
    next();
  },

  // Trackear registro automáticamente
  trackRegistration: async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Si el registro fue exitoso
      if (data.success && req.body.email) {
        // Trackear el evento de registro en segundo plano
        EventLogger.userRegistered(
          data.user?.id, 
          {
            email: req.body.email,
            nombre: req.body.nombre,
            suscripcion: 'bronce'
          }, 
          req
        ).catch(err => {
          console.error('Error tracking registration:', err);
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  },

  // Trackear búsquedas de jugadores
  trackPlayerSearch: async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // ✅ CAMBIO: req.usuario en lugar de req.user (para rutas autenticadas)
      if (req.usuario && data.player_name) {
        const searchData = {
          player_name: data.player_name,
          sala: req.params.sala,
          found: !!data.player_name
        };
        
        EventLogger.playerSearch(req.usuario.id, searchData, req).catch(err => {
          console.error('Error tracking player search:', err);
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  },

  // Trackear solicitudes de análisis IA
  trackAIAnalysis: async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // ✅ CAMBIO: req.usuario en lugar de req.user
      if (req.usuario && data.analisis) {
        const analysisData = {
          player_name: req.params.nombre,
          sala: req.params.sala,
          suscripcion: req.usuario.suscripcion
        };
        
        EventLogger.aiAnalysisRequested(req.usuario.id, analysisData, req).catch(err => {
          console.error('Error tracking AI analysis:', err);
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  },

  // Trackear cambios de favoritos
  trackFavoriteAction: (action = 'added') => {
    return async (req, res, next) => {
      const originalJson = res.json;
      
      res.json = function(data) {
        // ✅ CAMBIO: req.usuario en lugar de req.user
        if (req.usuario && data.success) {
          const favoriteData = {
            player_name: req.body.player_name || req.params.player_name,
            sala: req.body.sala || req.params.sala
          };
          
          if (action === 'added') {
            EventLogger.favoriteAdded(req.usuario.id, favoriteData, req).catch(err => {
              console.error('Error tracking favorite added:', err);
            });
          } else if (action === 'removed') {
            EventLogger.favoriteRemoved(req.usuario.id, favoriteData, req).catch(err => {
              console.error('Error tracking favorite removed:', err);
            });
          }
        }
        
        return originalJson.call(this, data);
      };
      
      next();
    };
  },

  // Middleware general para inicializar tablas
  initializeTables: async (req, res, next) => {
    try {
      // Solo ejecutar una vez al inicializar la app
      if (!global.tablesInitialized) {
        const EventModel = require('../models/eventModel');
        const MetricModel = require('../models/metricModel');
        
        await EventModel.createTable();
        await MetricModel.createTable();
        
        global.tablesInitialized = true;
        console.log('✅ Tablas de eventos y métricas inicializadas');
      }
    } catch (error) {
      console.error('❌ Error inicializando tablas:', error);
    }
    
    next();
  }
};

module.exports = trackingMiddleware;