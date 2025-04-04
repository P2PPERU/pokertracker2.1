const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verificarToken } = require("../middleware/authMiddleware");

// ✅ Obtener todos los favoritos del usuario autenticado
router.get("/", verificarToken, async (req, res) => {
  console.log("🔥 GET /api/favoritos llamado");
  const usuario_id = req.usuario.id;

  try {
    const result = await db.query(
      "SELECT player_name, sala FROM jugadores_favoritos WHERE usuario_id = $1",
      [usuario_id]
    );
    res.json(result.rows); // [{ player_name, sala }]
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ error: "Error al obtener favoritos" });
  }
});

// ✅ Verificar si un jugador es favorito
router.get("/:sala/:player_name", verificarToken, async (req, res) => {
  const usuario_id = req.usuario.id;
  const { sala, player_name } = req.params;

  try {
    const result = await db.query(
      "SELECT 1 FROM jugadores_favoritos WHERE usuario_id = $1 AND player_name = $2 AND sala = $3",
      [usuario_id, player_name, sala]
    );
    res.json({ favorito: result.rows.length > 0 });
  } catch (error) {
    console.error("Error al verificar favorito:", error);
    res.status(500).json({ error: "Error al verificar favorito" });
  }
});

// ✅ Agregar favorito (evita duplicados)
router.post("/", verificarToken, async (req, res) => {
  const usuario_id = req.usuario.id;
  const { player_name, sala } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO jugadores_favoritos (usuario_id, player_name, sala, fecha_agregado)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (usuario_id, player_name, sala) DO NOTHING
       RETURNING *`,
      [usuario_id, player_name, sala]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "Ya es favorito" });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    res.status(500).json({ error: "Error al agregar favorito" });
  }
});

// ✅ Eliminar favorito
router.delete("/:sala/:player_name", verificarToken, async (req, res) => {
  const usuario_id = req.usuario.id;
  const { player_name, sala } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM jugadores_favoritos WHERE usuario_id = $1 AND player_name = $2 AND sala = $3 RETURNING *",
      [usuario_id, player_name, sala]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Favorito no encontrado" });
    }

    res.json({ message: "Favorito eliminado" });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    res.status(500).json({ error: "Error al eliminar favorito" });
  }
});

module.exports = router;
