const express = require('express');
const router = express.Router();
const MetricController = require('../controllers/metricController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware'); // ✅ CORREGIDO

// Middleware de autenticación
router.use(verificarToken); // ✅ CORREGIDO

// Middleware para verificar que sea admin
const adminOnly = verificarAdmin; // ✅ SIMPLIFICADO

// 📈 RUTAS DE MÉTRICAS

// GET /api/metrics/dashboard - Métricas principales del dashboard
router.get('/dashboard', adminOnly, MetricController.getDashboardMetrics);

// GET /api/metrics/historical - Métricas históricas
router.get('/historical', adminOnly, MetricController.getHistoricalMetrics);

// GET /api/metrics/financial - Métricas financieras específicas
router.get('/financial', adminOnly, MetricController.getFinancialMetrics);

// POST /api/metrics/calculate - Calcular métricas manualmente
router.post('/calculate', adminOnly, MetricController.calculateMetrics);

// POST /api/metrics/recalculate - Recalcular todas las métricas
router.post('/recalculate', adminOnly, MetricController.recalculateAllMetrics);

module.exports = router;