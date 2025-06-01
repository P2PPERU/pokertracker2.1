const EventModel = require('../models/eventModel');

// Tipos de eventos disponibles
const EVENT_TYPES = {
  USER_LOGIN: 'user_login',
  USER_REGISTERED: 'user_registered',
  PLAYER_SEARCH: 'player_search',
  AI_ANALYSIS_REQUESTED: 'ai_analysis_requested',
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  FAVORITE_ADDED: 'favorite_added',
  FAVORITE_REMOVED: 'favorite_removed',
  PROFILE_UPDATED: 'profile_updated',
  PASSWORD_RESET: 'password_reset'
};

const EventLogger = {
  // Función principal para logear eventos
  log: async (userId, eventType, eventData = {}, req = null) => {
    try {
      const logData = {
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        ip_address: req ? req.ip : null,
        user_agent: req ? req.get('User-Agent') : null
      };

      const event = await EventModel.create(logData);
      console.log(`📊 Event logged: ${eventType} for user ${userId}`);
      return event;
    } catch (error) {
      console.error('❌ Error logging event:', error);
      // No lanzar error para no romper el flujo principal
      return null;
    }
  },

  // Funciones específicas para cada tipo de evento
  userLogin: async (userId, req) => {
    return await EventLogger.log(userId, EVENT_TYPES.USER_LOGIN, {
      timestamp: new Date().toISOString()
    }, req);
  },

  userRegistered: async (userId, userData, req) => {
    return await EventLogger.log(userId, EVENT_TYPES.USER_REGISTERED, {
      email: userData.email,
      nombre: userData.nombre,
      suscripcion: userData.suscripcion || 'bronce'
    }, req);
  },

  playerSearch: async (userId, searchData, req) => {
    return await EventLogger.log(userId, EVENT_TYPES.PLAYER_SEARCH, {
      player_name: searchData.player_name,
      sala: searchData.sala,
      found: searchData.found || false
    }, req);
  },

  aiAnalysisRequested: async (userId, analysisData, req) => {
    return await EventLogger.log(userId, EVENT_TYPES.AI_ANALYSIS_REQUESTED, {
      player_name: analysisData.player_name,
      sala: analysisData.sala,
      suscripcion: analysisData.suscripcion
    }, req);
  },

  subscriptionActivated: async (userId, subscriptionData, req) => {
    return await EventLogger.log(userId, EVENT_TYPES.SUBSCRIPTION_ACTIVATED, {
      plan: subscriptionData.plan,
      price: subscriptionData.price || 11.99,
      expires: subscriptionData.expires
    }, req);
  },

  subscriptionCancelled: async (userId, subscriptionData, req) => {
    return await EventLogger.log(userId, EVENT_TYPES.SUBSCRIPTION_CANCELLED, {
      plan: subscriptionData.plan,
      reason: subscriptionData.reason || 'not_specified'
    }, req);
  },

  favoriteAdded: async (userId, favoriteData, req) => {
    return await EventLogger.log(userId, EVENT_TYPES.FAVORITE_ADDED, {
      player_name: favoriteData.player_name,
      sala: favoriteData.sala
    }, req);
  },

  favoriteRemoved: async (userId, favoriteData, req) => {
    return await EventLogger.log(userId, EVENT_TYPES.FAVORITE_REMOVED, {
      player_name: favoriteData.player_name,
      sala: favoriteData.sala
    }, req);
  }
};

// Exportar tipos de eventos y logger
module.exports = {
  EventLogger,
  EVENT_TYPES
};