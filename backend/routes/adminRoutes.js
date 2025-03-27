const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verificarToken, verificarAdmin } = require("../middleware/authMiddleware");

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

module.exports = router;