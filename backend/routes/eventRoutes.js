const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware'); // ✅ CORREGIDO

// 📊 RUTAS DE EVENTOS

// Middleware de autenticación para todas las rutas
router.use(verificarToken); // ✅ CORREGIDO - usar verificarToken específicamente

// POST /api/events - Crear evento manualmente (para testing)
router.post('/', EventController.createEvent);

// GET /api/events/user/:userId - Obtener eventos de un usuario
router.get('/user/:userId', EventController.getUserEvents);

// GET /api/events/type/:eventType - Obtener eventos por tipo
router.get('/type/:eventType', EventController.getEventsByType);

// GET /api/events/stats - Obtener estadísticas de eventos
router.get('/stats', EventController.getEventStats);

// DELETE /api/events/cleanup - Limpiar eventos antiguos (solo admin)
router.delete('/cleanup', verificarAdmin, EventController.cleanOldEvents); // ✅ CORREGIDO

module.exports = router;