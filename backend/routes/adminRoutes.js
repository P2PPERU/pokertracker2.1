const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verificarToken, verificarAdmin } = require("../middleware/authMiddleware");

// 📊 NUEVO: Importar controladores de métricas
const MetricController = require("../controllers/metricController");
const EventController = require("../controllers/eventController");
const StatsCSVController = require("../controllers/statsCSVController");

// ✅ Obtener lista de todos los usuarios con conteo de solicitudes IA usadas
router.get("/usuarios", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, u.nombre, u.email, u.rol, u.suscripcion, u.suscripcion_expira, u.fecha_creacion, u.solicitudes_restantes,
        COALESCE(COUNT(a.id), 0) AS solicitudes_ia_mes
      FROM usuarios u
      LEFT JOIN analisis_ia_logs a ON a.usuario_id = u.id AND a.fecha >= NOW() - INTERVAL '30 days'
      GROUP BY u.id
      ORDER BY u.fecha_creacion DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error interno al obtener usuarios" });
  }
});

// ✅ Cambiar el nivel de suscripción de un usuario
router.put("/usuarios/:id/suscripcion", verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { nuevaSuscripcion } = req.body;

  try {
    await pool.query("UPDATE usuarios SET suscripcion = $1 WHERE id = $2", [nuevaSuscripcion, id]);
    res.json({ mensaje: "Suscripción actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar suscripción:", error);
    res.status(500).json({ error: "Error interno al actualizar suscripción" });
  }
});

// ✅ Cambiar fecha de expiración de una suscripción
router.put("/usuarios/:id/expiracion", verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { nuevaFecha } = req.body;

  try {
    await pool.query("UPDATE usuarios SET suscripcion_expira = $1 WHERE id = $2", [nuevaFecha, id]);
    res.json({ mensaje: "Fecha de expiración actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar fecha:", error);
    res.status(500).json({ error: "Error interno al actualizar fecha de expiración" });
  }
});

// ✅ Eliminar usuario
router.delete("/usuario/:id", verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error interno al eliminar usuario" });
  }
});

// ✅ Bloquear o desbloquear usuario (campo activo opcional)
router.put("/usuarios/:id/bloquear", verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body; // true o false

  try {
    await pool.query("UPDATE usuarios SET activo = $1 WHERE id = $2", [activo, id]);
    res.json({ mensaje: activo ? "Usuario activado" : "Usuario bloqueado" });
  } catch (error) {
    console.error("❌ Error al bloquear usuario:", error);
    res.status(500).json({ error: "Error interno al actualizar estado del usuario" });
  }
});

// 📊 NUEVOS ENDPOINTS DE MÉTRICAS PARA ADMIN

// Dashboard principal de métricas
router.get("/metrics-dashboard", verificarToken, verificarAdmin, MetricController.getDashboardMetrics);

// Métricas históricas
router.get("/metrics-historical", verificarToken, verificarAdmin, MetricController.getHistoricalMetrics);

// Métricas financieras específicas
router.get("/metrics-financial", verificarToken, verificarAdmin, MetricController.getFinancialMetrics);

// Calcular métricas manualmente
router.post("/calculate-metrics", verificarToken, verificarAdmin, MetricController.calculateMetrics);

// Recalcular todas las métricas
router.post("/recalculate-metrics", verificarToken, verificarAdmin, MetricController.recalculateAllMetrics);

// 📊 ENDPOINTS DE EVENTOS PARA ADMIN

// Estadísticas de eventos
router.get("/events-stats", verificarToken, verificarAdmin, EventController.getEventStats);

// Eventos por tipo
router.get("/events/:eventType", verificarToken, verificarAdmin, EventController.getEventsByType);

// Limpiar eventos antiguos
router.delete("/events-cleanup", verificarToken, verificarAdmin, EventController.cleanOldEvents);

// 📊 NUEVOS ENDPOINTS DE STATS CSV PARA ADMIN
router.post("/upload-stats-csv", verificarToken, verificarAdmin, StatsCSVController.uploadStatsCSV);
router.get("/stats-csv-info", verificarToken, verificarAdmin, StatsCSVController.getUploadStats);

// 📊 DASHBOARD DE ARCHIVOS CSV CARGADOS
router.get("/csv-dashboard", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        fecha_snapshot,
        tipo_periodo,
        sala,
        stake_category,  -- Asegúrate de que esto esté aquí
        COUNT(*) as total_jugadores,
        MAX(updated_at) as ultimo_procesamiento
      FROM jugadores_stats_csv 
      GROUP BY fecha_snapshot, tipo_periodo, sala, stake_category  -- Y aquí también
      ORDER BY fecha_snapshot DESC, stake_category, sala
    `;
    
    const { rows } = await pool.query(query);
    
    // Calcular resumen
    const resumen = {
      total_snapshots: rows.length,
      ultima_fecha: rows[0]?.fecha_snapshot,
      total_jugadores: rows.reduce((sum, r) => sum + parseInt(r.total_jugadores), 0)
    };
    
    res.json({
      success: true,
      archivos_cargados: rows,
      resumen: resumen
    });
  } catch (error) {
    console.error("❌ Error en dashboard CSV:", error);
    res.status(500).json({ error: "Error obteniendo dashboard CSV" });
  }
});


module.exports = router;