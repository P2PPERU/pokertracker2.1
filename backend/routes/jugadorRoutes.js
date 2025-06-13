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

// 📊 NUEVO: Importar EventLogger para tracking específico
const { EventLogger } = require("../utils/eventLogger");

// ✨ Salas válidas ACTUALIZADAS para CSV
const SALAS_VALIDAS = ['XPK', 'PPP', 'PM'];

// ✨ Función helper para validar sala
const validarSala = (sala) => {
  if (!sala || !SALAS_VALIDAS.includes(sala)) {
    return { 
      valido: false, 
      error: `Sala no válida. Salas disponibles: ${SALAS_VALIDAS.join(', ')}` 
    };
  }
  return { valido: true };
};

// ✨ Función helper para validar fechas CSV
const validarFechaCSV = (fecha) => {
  if (fecha) {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return { valido: false, error: "Formato de fecha inválido. Use formato YYYY-MM-DD" };
    }
    
    const hoy = new Date();
    if (fechaObj > hoy) {
      return { valido: false, error: "La fecha no puede ser futura" };
    }
  }
  return { valido: true };
};

// ✅ Proteger la mayoría de rutas con verificarToken donde sea necesario

// ✨ Ruta principal para obtener datos del jugador (ACTUALIZADA para CSV)
router.get("/jugador/:sala/:nombre", verificarToken, getJugador);

// ✨ Ruta para autocompletar (ACTUALIZADA para CSV)
router.get("/jugador/autocomplete/:sala/:query", async (req, res) => {
  try {
    const { sala, query } = req.params;
    
    // ✨ Validar sala (solo CSV)
    const validacionSala = validarSala(sala);
    if (!validacionSala.valido) {
      return res.status(400).json({ error: validacionSala.error });
    }
    
    if (!query || query.length < 3) {
      return res.json([]);
    }

    console.log(`🔍 Autocompletado CSV: ${query} en ${sala}`);
    const jugadores = await getJugadorSugerencias(query, sala);
    console.log(`🔹 Sugerencias encontradas: ${jugadores.length}`);

    res.json(jugadores);
  } catch (error) {
    console.error("❌ Error en autocompletado CSV:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ✨ Gráfico de ganancias — protegido (ACTUALIZADO para CSV)
router.get("/grafico-ganancias/:nombre", verificarToken, getGraficoGanancias);

// ✨ NUEVO: Ruta para obtener todos los stakes de un jugador
router.get("/jugador/:sala/:nombre/stakes", verificarToken, async (req, res) => {
  const jugadorController = require("../controllers/jugadorController");
  return jugadorController.getStakesJugador(req, res);
});

// Ranking por stake — protegido (ACTUALIZADO para CSV)
router.get("/top-jugadores/:stake", getTopJugadoresPorStake);

// ✨ Ruta de análisis IA COMPLETAMENTE ACTUALIZADA para CSV
router.get("/jugador/:sala/:nombre/analisis", verificarToken, async (req, res) => {
  const { nombre, sala } = req.params;
  const { tipoPeriodo = 'total', fecha } = req.query; // ✨ Parámetros CSV
  const usuarioId = req.usuario.id;
  const suscripcion = req.usuario.suscripcion;
  const limites = { plata: 50, oro: 250 };
  const MIN_MANOS_DELTA = 100; // ✨ Reducido para CSV

  // Validar suscripción
  if (!["plata", "oro"].includes(suscripcion)) {
    return res.status(403).json({ error: "Tu suscripción no permite análisis IA." });
  }

  // ✨ Validar sala (solo CSV)
  const validacionSala = validarSala(sala);
  if (!validacionSala.valido) {
    return res.status(400).json({ error: validacionSala.error });
  }

  // ✨ Validar tipo de período
  if (!['total', 'semana', 'mes'].includes(tipoPeriodo)) {
    return res.status(400).json({ 
      error: "tipoPeriodo debe ser: total, semana, o mes" 
    });
  }

  // ✨ Validar fecha si se proporciona
  const validacionFecha = validarFechaCSV(fecha);
  if (!validacionFecha.valido) {
    return res.status(400).json({ error: validacionFecha.error });
  }

  try {
    // Obtener datos del jugador desde CSV
    const jugador = await getJugadorData(nombre, sala, tipoPeriodo, fecha);
    if (!jugador) {
      const mensaje = fecha 
        ? `Jugador '${nombre}' no encontrado en '${sala}' para ${tipoPeriodo} del ${fecha}`
        : `Jugador '${nombre}' no encontrado en '${sala}' para período '${tipoPeriodo}'`;
      
      return res.status(404).json({ error: mensaje });
    }

    const totalActualManos = jugador.hands;

    // ✨ Clave de caché CSV
    const cacheKey = `csv-${nombre}-${sala}-${tipoPeriodo}-${fecha || 'latest'}`;

    // Buscar análisis guardado (actualizar consulta para CSV)
    const existente = await pool.query(
      `SELECT analisis, total_manos, tipo_periodo, fecha_snapshot 
       FROM analisis_guardados_csv 
       WHERE player_name = $1 AND sala = $2 
       AND tipo_periodo = $3
       AND (fecha_snapshot = $4 OR $4 IS NULL)`,
      [nombre, sala, tipoPeriodo, fecha]
    );

    // Consultar solicitudes del último mes
    const { rows } = await pool.query(`
      SELECT COUNT(*) AS conteo
      FROM analisis_ia_logs
      WHERE usuario_id = $1 AND fecha >= NOW() - INTERVAL '30 days'
    `, [usuarioId]);

    const solicitudesMes = parseInt(rows[0].conteo, 10);
    const solicitudesRestantes = limites[suscripcion] - solicitudesMes;

    // Si existe análisis previo reciente, devolverlo
    if (existente.rows.length > 0) {
      const analisisPrevio = existente.rows[0];
      const manosPrevias = analisisPrevio.total_manos;
      const diferenciaManos = totalActualManos - manosPrevias;

      if (diferenciaManos < MIN_MANOS_DELTA) {
        return res.json({
          analisis: { 
            jugador: nombre, 
            analisis: analisisPrevio.analisis,
            periodo: { tipo: tipoPeriodo, fecha: analisisPrevio.fecha_snapshot }
          },
          solicitudesRestantes,
          suscripcion,
          fromCache: true,
          manosAnteriores: manosPrevias,
          manosActuales: totalActualManos,
          data_source: 'CSV'
        });
      }
    }

    // Verificar límite de solicitudes
    if (solicitudesRestantes <= 0) {
      return res.status(403).json({
        error: `Has alcanzado tu límite mensual de ${limites[suscripcion]} solicitudes.`,
        solicitudesRestantes: 0,
        suscripcion,
      });
    }

    // 🧠 Generar análisis nuevo con datos CSV
    console.log(`🤖 Generando análisis IA CSV para ${nombre} en ${sala} (${tipoPeriodo})`);
    const nuevoAnalisis = await interpretarJugadorData(nombre, sala, tipoPeriodo, fecha);
    
    if (!nuevoAnalisis || !nuevoAnalisis.analisis) {
      return res.status(500).json({ error: "No se pudo generar el análisis IA." });
    }

    // ✨ Guardar análisis actualizado CSV
    try {
      // Ya no necesitamos crear la tabla porque ya la creaste manualmente
      
      await pool.query(`
        INSERT INTO analisis_guardados_csv (player_name, sala, tipo_periodo, fecha_snapshot, analisis, total_manos)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (player_name, sala, tipo_periodo, fecha_snapshot)
        DO UPDATE SET 
          analisis = EXCLUDED.analisis, 
          total_manos = EXCLUDED.total_manos,
          fecha_actualizacion = NOW()
      `, [nombre, sala, tipoPeriodo, fecha || null, nuevoAnalisis.analisis, totalActualManos]);
      
    } catch (dbError) {
      console.warn("⚠️ Error guardando análisis CSV (continuando):", dbError.message);
    }

    // Registrar uso de la IA
    try {
      await pool.query(
        "INSERT INTO analisis_ia_logs (usuario_id, jugador_nombre, sala, tipo_periodo, fecha_snapshot) VALUES ($1, $2, $3, $4, $5)",
        [usuarioId, nombre, sala, tipoPeriodo, fecha]
      );
    } catch (logError) {
      console.warn("⚠️ Error registrando log (continuando):", logError.message);
    }

    // 📊 NUEVO: Trackear solicitud de análisis IA CSV
    EventLogger.aiAnalysisRequested(usuarioId, {
      player_name: nombre,
      sala: sala,
      suscripcion: suscripcion,
      solicitudes_restantes: solicitudesRestantes - 1,
      from_cache: false,
      tipo_periodo: tipoPeriodo,
      fecha_snapshot: fecha,
      total_manos: totalActualManos,
      data_source: 'CSV'
    }, req).catch(console.error);

    res.json({
      analisis: nuevoAnalisis,
      solicitudesRestantes: solicitudesRestantes - 1,
      suscripcion,
      fromCache: false,
      manosAnteriores: existente.rows[0]?.total_manos || null,
      manosActuales: totalActualManos,
      data_source: 'CSV'
    });

  } catch (error) {
    console.error("❌ Error generando análisis IA CSV:", error);
    res.status(500).json({ error: "Error interno al generar el análisis IA." });
  }
});

// ✨ RUTA ACTUALIZADA: Obtener información de salas disponibles (solo CSV)
router.get("/salas", (req, res) => {
  const salasInfo = [
    { codigo: 'XPK', nombre: 'X-Poker', activa: true },
    { codigo: 'PPP', nombre: 'PPPoker', activa: true },
    { codigo: 'PM', nombre: 'PokerMaster/ClubGG', activa: true }
  ];

  res.json({
    salas: salasInfo,
    total: salasInfo.length,
    mensaje: "Salas disponibles para búsqueda de jugadores (CSV)",
    data_source: "CSV"
  });
});

// ✨ RUTA ACTUALIZADA: Verificar estado del sistema CSV
router.get("/status", verificarToken, async (req, res) => {
  try {
    // Verificar conexión a CSV
    const testQuery = "SELECT COUNT(*) as total FROM jugadores_stats_csv LIMIT 1";
    const result = await pool.query(testQuery);
    
    // Obtener estadísticas básicas CSV
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT jugador_nombre) as total_jugadores,
        COUNT(*) as total_registros,
        COUNT(DISTINCT sala) as salas_activas,
        MAX(fecha_snapshot) as ultima_actualizacion,
        COUNT(DISTINCT stake_category) as stakes_diferentes
      FROM jugadores_stats_csv
    `;
    const stats = await pool.query(statsQuery);

    // Estadísticas por período
    const periodoStats = await pool.query(`
      SELECT 
        tipo_periodo,
        COUNT(DISTINCT jugador_nombre) as jugadores,
        MAX(fecha_snapshot) as ultima_fecha
      FROM jugadores_stats_csv
      GROUP BY tipo_periodo
    `);

    res.json({
      status: "conectado",
      data_source: "CSV",
      version: "1.0.0",
      estadisticas: {
        total_jugadores: stats.rows[0].total_jugadores,
        total_registros: stats.rows[0].total_registros,
        salas_activas: stats.rows[0].salas_activas,
        ultima_actualizacion: stats.rows[0].ultima_actualizacion,
        stakes_diferentes: stats.rows[0].stakes_diferentes
      },
      por_periodo: periodoStats.rows,
      salas_soportadas: SALAS_VALIDAS,
      periodos_disponibles: ['total', 'semana', 'mes'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Error verificando estado CSV:", error);
    res.status(500).json({
      status: "error",
      error: "No se pudo conectar al sistema CSV",
      data_source: "CSV",
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;