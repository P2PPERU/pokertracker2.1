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

// ✨ Salas válidas ACTUALIZADAS
const SALAS_VALIDAS = ['XPK', 'PPP', 'SUP', 'CNP', 'PM'];

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

// ✨ Función helper para validar fechas en rutas
const validarFechasRuta = (fechaDesde, fechaHasta) => {
  if (fechaDesde || fechaHasta) {
    if ((fechaDesde && !fechaHasta) || (!fechaDesde && fechaHasta)) {
      return { 
        valido: false, 
        error: "Se requieren ambas fechas: fechaDesde y fechaHasta" 
      };
    }
    
    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);
    
    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      return { valido: false, error: "Formato de fecha inválido" };
    }
    
    if (desde > hasta) {
      return { 
        valido: false, 
        error: "La fecha 'desde' debe ser anterior o igual a la fecha 'hasta'" 
      };
    }
  }
  
  return { valido: true };
};

// ✅ Proteger la mayoría de rutas con verificarToken donde sea necesario

// ✨ Ruta principal para obtener datos del jugador (ACTUALIZADA con filtros de fecha)
router.get("/jugador/:sala/:nombre", verificarToken, getJugador);

// ✨ Ruta para autocompletar (ACTUALIZADA para validar CNP y PM)
router.get("/jugador/autocomplete/:sala/:query", async (req, res) => {
  try {
    const { sala, query } = req.params;
    
    // ✨ Validar sala (ahora incluye CNP y PM)
    const validacionSala = validarSala(sala);
    if (!validacionSala.valido) {
      return res.status(400).json({ error: validacionSala.error });
    }
    
    if (!query || query.length < 3) {
      return res.json([]);
    }

    console.log(`🔍 Autocompletado PT4: ${query} en ${sala}`);
    const jugadores = await getJugadorSugerencias(query, sala);
    console.log(`🔹 Sugerencias encontradas: ${jugadores.length}`);

    res.json(jugadores);
  } catch (error) {
    console.error("❌ Error en autocompletado PT4:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ✨ Gráfico de ganancias — protegido (ACTUALIZADO con filtros de fecha)
router.get("/grafico-ganancias/:nombre", verificarToken, getGraficoGanancias);

// Ranking por stake — protegido (sin cambios)
router.get("/top-jugadores/:stake", verificarToken, getTopJugadoresPorStake);

// ✨ Ruta de análisis IA COMPLETAMENTE ACTUALIZADA con validación y filtros de fecha
router.get("/jugador/:sala/:nombre/analisis", verificarToken, async (req, res) => {
  const { nombre, sala } = req.params;
  const { fechaDesde, fechaHasta } = req.query; // ✨ Parámetros de fecha
  const usuarioId = req.usuario.id;
  const suscripcion = req.usuario.suscripcion;
  const limites = { plata: 50, oro: 250 };
  const MIN_MANOS_DELTA = 250;

  // Validar suscripción
  if (!["plata", "oro"].includes(suscripcion)) {
    return res.status(403).json({ error: "Tu suscripción no permite análisis IA." });
  }

  // ✨ Validar sala (ahora incluye CNP y PM)
  const validacionSala = validarSala(sala);
  if (!validacionSala.valido) {
    return res.status(400).json({ error: validacionSala.error });
  }

  // ✨ Validar fechas si se proporcionan
  const validacionFechas = validarFechasRuta(fechaDesde, fechaHasta);
  if (!validacionFechas.valido) {
    return res.status(400).json({ error: validacionFechas.error });
  }

  try {
    // Obtener datos del jugador con filtros de fecha
    const jugador = await getJugadorData(nombre, sala, fechaDesde, fechaHasta);
    if (!jugador) {
      const mensaje = fechaDesde && fechaHasta 
        ? `Jugador '${nombre}' no encontrado en '${sala}' para el período ${fechaDesde} - ${fechaHasta}`
        : `Jugador '${nombre}' no encontrado en '${sala}'`;
      
      return res.status(404).json({ error: mensaje });
    }

    const totalActualManos = jugador.total_manos;

    // ✨ Clave de caché que incluye filtros de fecha
    const periodoKey = fechaDesde && fechaHasta 
      ? `${fechaDesde}-${fechaHasta}`
      : 'completo';
    const cacheKey = `${nombre}-${sala}-${periodoKey}`;

    // Buscar análisis guardado (actualizar consulta para incluir fechas)
    const existente = await pool.query(
      `SELECT analisis, total_manos, fecha_desde, fecha_hasta 
       FROM analisis_guardados 
       WHERE player_name = $1 AND sala = $2 
       AND COALESCE(fecha_desde::text, '') = $3 
       AND COALESCE(fecha_hasta::text, '') = $4`,
      [nombre, sala, fechaDesde || '', fechaHasta || '']
    );

    // Consultar solicitudes del último mes
    const { rows } = await pool.query(`
      SELECT COUNT(*) AS conteo
      FROM analisis_ia_logs
      WHERE usuario_id = $1 AND fecha >= NOW() - INTERVAL '30 days'
    `, [usuarioId]);

    const solicitudesMes = parseInt(rows[0].conteo, 10);
    const solicitudesRestantes = limites[suscripcion] - solicitudesMes;

    // Si existe análisis previo con pocas manos nuevas, devolverlo
    if (existente.rows.length > 0) {
      const analisisPrevio = existente.rows[0];
      const manosPrevias = analisisPrevio.total_manos;
      const diferenciaManos = totalActualManos - manosPrevias;

      // ✨ Para análisis con filtro de fecha, ser más permisivo con el cache
      const deltaRequerido = (fechaDesde && fechaHasta) ? 100 : MIN_MANOS_DELTA;

      if (diferenciaManos < deltaRequerido) {
        return res.json({
          analisis: { 
            jugador: nombre, 
            analisis: analisisPrevio.analisis,
            periodo: fechaDesde && fechaHasta ? { desde: fechaDesde, hasta: fechaHasta } : null
          },
          solicitudesRestantes,
          suscripcion,
          fromCache: true,
          manosAnteriores: manosPrevias,
          manosActuales: totalActualManos,
          periodo: fechaDesde && fechaHasta ? { desde: fechaDesde, hasta: fechaHasta } : null,
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

    // 🧠 Generar análisis nuevo con filtros de fecha
    console.log(`🤖 Generando análisis IA para ${nombre} en ${sala}${fechaDesde && fechaHasta ? ` (${fechaDesde} - ${fechaHasta})` : ''}`);
    const nuevoAnalisis = await interpretarJugadorData(nombre, sala, fechaDesde, fechaHasta);
    
    if (!nuevoAnalisis || !nuevoAnalisis.analisis) {
      return res.status(500).json({ error: "No se pudo generar el análisis IA." });
    }

    // ✨ Guardar análisis actualizado con información de fechas
    try {
      await pool.query(`
        INSERT INTO analisis_guardados (player_name, sala, analisis, total_manos, fecha_desde, fecha_hasta)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (player_name, sala, COALESCE(fecha_desde::text, ''), COALESCE(fecha_hasta::text, ''))
        DO UPDATE SET 
          analisis = EXCLUDED.analisis, 
          total_manos = EXCLUDED.total_manos,
          fecha_actualizacion = NOW()
      `, [nombre, sala, nuevoAnalisis.analisis, totalActualManos, fechaDesde, fechaHasta]);
    } catch (dbError) {
      console.warn("⚠️ Error guardando análisis (continuando):", dbError.message);
    }

    // Registrar uso de la IA
    try {
      await pool.query(
        "INSERT INTO analisis_ia_logs (usuario_id, jugador_nombre, sala, fecha_desde, fecha_hasta) VALUES ($1, $2, $3, $4, $5)",
        [usuarioId, nombre, sala, fechaDesde, fechaHasta]
      );
    } catch (logError) {
      console.warn("⚠️ Error registrando log (continuando):", logError.message);
    }

    // 📊 NUEVO: Trackear solicitud de análisis IA con información de filtros
    EventLogger.aiAnalysisRequested(usuarioId, {
      player_name: nombre,
      sala: sala,
      suscripcion: suscripcion,
      solicitudes_restantes: solicitudesRestantes - 1,
      from_cache: false,
      fecha_filtro: fechaDesde && fechaHasta ? { desde: fechaDesde, hasta: fechaHasta } : null,
      total_manos: totalActualManos
    }, req).catch(console.error);

    res.json({
      analisis: nuevoAnalisis,
      solicitudesRestantes: solicitudesRestantes - 1,
      suscripcion,
      fromCache: false,
      manosAnteriores: existente.rows[0]?.total_manos || null,
      manosActuales: totalActualManos,
      periodo: fechaDesde && fechaHasta ? { desde: fechaDesde, hasta: fechaHasta } : null,
    });

  } catch (error) {
    console.error("❌ Error generando análisis IA:", error);
    res.status(500).json({ error: "Error interno al generar el análisis IA." });
  }
});

// ✨ NUEVA RUTA: Obtener información de salas disponibles
router.get("/salas", (req, res) => {
  const salasInfo = [
    { codigo: 'XPK', nombre: 'X-Poker', activa: true },
    { codigo: 'PPP', nombre: 'PPPoker', activa: true },
    { codigo: 'SUP', nombre: 'SupremaPoker', activa: true },
    { codigo: 'CNP', nombre: 'CoinPoker', activa: true },
    { codigo: 'PM', nombre: 'PokerMaster', activa: true }
  ];

  res.json({
    salas: salasInfo,
    total: salasInfo.length,
    mensaje: "Salas disponibles para búsqueda de jugadores"
  });
});

// ✨ NUEVA RUTA: Verificar estado de la conexión PT4
router.get("/status", verificarToken, async (req, res) => {
  try {
    // Verificar conexión a PT4
    const testQuery = "SELECT COUNT(*) as total FROM player LIMIT 1";
    const result = await pool.query(testQuery);
    
    // Obtener estadísticas básicas
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT p.id_player) as total_jugadores,
        COUNT(chps.id_hand) as total_manos,
        COUNT(DISTINCT s.site_abbrev) as salas_activas
      FROM player p
      LEFT JOIN cash_hand_player_statistics chps ON p.id_player = chps.id_player
      LEFT JOIN lookup_sites s ON p.id_site = s.id_site
      WHERE chps.date_played >= CURRENT_DATE - INTERVAL '30 days'
    `;
    const stats = await pool.query(statsQuery);

    res.json({
      status: "conectado",
      pt4_version: "Compatible",
      estadisticas: {
        jugadores_activos_30d: stats.rows[0].total_jugadores,
        manos_jugadas_30d: stats.rows[0].total_manos,
        salas_con_actividad: stats.rows[0].salas_activas
      },
      salas_soportadas: SALAS_VALIDAS,
      filtros_fecha: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Error verificando estado PT4:", error);
    res.status(500).json({
      status: "error",
      error: "No se pudo conectar a PokerTracker 4",
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;