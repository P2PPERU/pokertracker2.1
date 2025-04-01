const express = require("express");
const router = express.Router();
const {
  getJugador,
  getTopJugadoresPorStake,
  getGraficoGanancias,
} = require("../controllers/jugadorController");
const {
  interpretarJugadorData,
  getJugadorSugerencias,
  getJugadorData,
} = require("../models/jugadorModel");
const pool = require("../config/db");
const { verificarToken } = require("../middleware/authMiddleware");

// ✅ Proteger la mayoría de rutas con verificarToken donde sea necesario

// Ruta protegida para obtener datos del jugador
router.get("/jugador/:sala/:nombre", verificarToken, getJugador);

// Ruta para autocompletar (sin token, puede ser pública si deseas)
router.get("/jugador/autocomplete/:sala/:query", async (req, res) => {
  try {
    const { sala, query } = req.params;
    if (!query || query.length < 3) {
      return res.json([]);
    }

    console.log("🔍 Buscando sugerencias para:", query, "en sala:", sala);
    const jugadores = await getJugadorSugerencias(query, sala);
    console.log("🔹 Sugerencias encontradas:", jugadores);

    res.json(jugadores);
  } catch (error) {
    console.error("❌ Error en autocompletado:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Gráfico de ganancias — protegido
router.get("/grafico-ganancias/:nombre", verificarToken, getGraficoGanancias);

// Ranking por stake — protegido
router.get("/top-jugadores/:stake", verificarToken, getTopJugadoresPorStake);

// 📌 Ruta de análisis IA con validación de suscripción y control de uso mensual
router.get("/jugador/:sala/:nombre/analisis", verificarToken, async (req, res) => {
  const { nombre, sala } = req.params;
  const usuarioId = req.usuario.id;
  const suscripcion = req.usuario.suscripcion;
  const limites = { plata: 50, oro: 250 };
  const MIN_MANOS_DELTA = 250;

  if (!["plata", "oro"].includes(suscripcion)) {
    return res.status(403).json({ error: "Tu suscripción no permite análisis IA." });
  }

  try {
    const jugador = await getJugadorData(nombre, sala);
    if (!jugador) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }

    const totalActualManos = jugador.total_manos;

    // Buscar análisis guardado
    const existente = await pool.query(
      "SELECT analisis, total_manos FROM analisis_guardados WHERE player_name = $1 AND sala = $2",
      [nombre, sala]
    );

    // Consultar solicitudes del último mes
    const { rows } = await pool.query(`
      SELECT COUNT(*) AS conteo
      FROM analisis_ia_logs
      WHERE usuario_id = $1 AND fecha >= NOW() - INTERVAL '30 days'
    `, [usuarioId]);

    const solicitudesMes = parseInt(rows[0].conteo, 10);
    const solicitudesRestantes = limites[suscripcion] - solicitudesMes;

    // Si existe análisis previo con pocas manos nuevas, se devuelve
    if (existente.rows.length > 0) {
      const analisisPrevio = existente.rows[0];
      const manosPrevias = analisisPrevio.total_manos;
      const diferenciaManos = totalActualManos - manosPrevias;

      if (diferenciaManos < MIN_MANOS_DELTA) {
        return res.json({
          analisis: { jugador: nombre, analisis: analisisPrevio.analisis },
          solicitudesRestantes,
          suscripcion,
          fromCache: true,
          manosAnteriores: manosPrevias,
          manosActuales: totalActualManos,
        });
      }
    }

    // Límite alcanzado
    if (solicitudesRestantes <= 0) {
      return res.status(403).json({
        error: `Has alcanzado tu límite mensual de ${limites[suscripcion]} solicitudes.`,
        solicitudesRestantes: 0,
        suscripcion,
      });
    }

    // 🧠 Generar análisis nuevo
    const nuevoAnalisis = await interpretarJugadorData(nombre, sala);
    if (!nuevoAnalisis || !nuevoAnalisis.analisis) {
      return res.status(500).json({ error: "No se pudo generar el análisis IA." });
    }

    // Guardar análisis actualizado
    await pool.query(`
      INSERT INTO analisis_guardados (player_name, sala, analisis, total_manos)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (player_name, sala)
      DO UPDATE SET analisis = EXCLUDED.analisis, total_manos = EXCLUDED.total_manos
    `, [nombre, sala, nuevoAnalisis.analisis, totalActualManos]);

    // Registrar uso de la IA
    await pool.query(
      "INSERT INTO analisis_ia_logs (usuario_id, jugador_nombre, sala) VALUES ($1, $2, $3)",
      [usuarioId, nombre, sala]
    );

    res.json({
      analisis: nuevoAnalisis,
      solicitudesRestantes: solicitudesRestantes - 1,
      suscripcion,
      fromCache: false,
      manosAnteriores: existente.rows[0]?.total_manos || null,
      manosActuales: totalActualManos,
    });

  } catch (error) {
    console.error("❌ Error generando análisis IA:", error);
    res.status(500).json({ error: "Error interno al generar el análisis IA." });
  }
});

module.exports = router;
