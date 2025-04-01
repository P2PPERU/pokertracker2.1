// favoritesRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');                           // Asegúrate de que la ruta sea correcta

// Obtener todos los favoritos de un usuario
router.get('/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM jugadores_favoritos WHERE usuario_id = $1',
      [usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

// Verificar si un jugador es favorito
router.get('/:usuario_id/:player_name', async (req, res) => {
  const { usuario_id, player_name } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM jugadores_favoritos WHERE usuario_id = $1 AND player_name = $2',
      [usuario_id, player_name]
    );
    res.json({ favorito: result.rows.length > 0 });
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    res.status(500).json({ error: 'Error al verificar favorito' });
  }
});

// Agregar un jugador a favoritos
router.post('/', async (req, res) => {
  const { usuario_id, player_name, sala } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO jugadores_favoritos (usuario_id, player_name, sala, fecha_agregado)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [usuario_id, player_name, sala]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({ error: 'Error al agregar favorito' });
  }
});

// Eliminar un jugador de favoritos
router.delete('/:usuario_id/:player_name', async (req, res) => {
  const { usuario_id, player_name } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM jugadores_favoritos WHERE usuario_id = $1 AND player_name = $2 RETURNING *',
      [usuario_id, player_name]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Favorito no encontrado' });
    }
    res.json({ message: 'Favorito eliminado' });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
});

module.exports = router;
