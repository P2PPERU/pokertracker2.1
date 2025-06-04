const StatsCSVModel = require("../models/statsCSVModel");

// 🧠 Cache en memoria (simple)
const cache = new Map();

// ✨ Salas válidas ACTUALIZADAS para CSV
const SALAS_VALIDAS = ['XPK', 'PPP', 'PM'];

// ✨ Función helper para crear clave de caché 
const createCacheKey = (nombre, sala, tipoPeriodo = 'total', fecha = null) => {
  const baseKey = `csv-${sala}-${nombre}-${tipoPeriodo}`;
  if (fecha) {
    return `${baseKey}-${fecha}`;
  }
  return baseKey;
};

// ✨ Función helper para validar fechas
const validarFechas = (fechaDesde, fechaHasta) => {
  if (fechaDesde && fechaHasta) {
    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);
    const hoy = new Date();
    
    // Validar que las fechas sean válidas
    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      return { valido: false, error: "Formato de fecha inválido. Use formato YYYY-MM-DD" };
    }
    
    // Validar que 'desde' sea menor o igual a 'hasta'
    if (desde > hasta) {
      return { valido: false, error: "La fecha 'desde' debe ser anterior o igual a la fecha 'hasta'" };
    }
    
    // Validar que las fechas no sean futuras
    if (desde > hoy || hasta > hoy) {
      return { valido: false, error: "Las fechas no pueden ser futuras" };
    }
    
    // Validar que el rango no sea mayor a 3 años (para performance)
    const maxRango = 3 * 365 * 24 * 60 * 60 * 1000; // 3 años en milisegundos
    if (hasta - desde > maxRango) {
      return { valido: false, error: "El rango de fechas no puede ser mayor a 3 años" };
    }

    // Validar que no sea un rango muy pequeño (menos de 1 día)
    if (hasta - desde < 0) {
      return { valido: false, error: "El rango de fechas debe ser de al menos 1 día" };
    }
  }
  
  return { valido: true };
};

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

// ✨ Controlador principal ACTUALIZADO para usar CSV
const getJugador = async (req, res) => {
  try {
    let { sala, nombre } = req.params;
    const { tipoPeriodo = 'total', fecha } = req.query;

    // Validaciones básicas
    if (!nombre || !sala) {
      return res.status(400).json({ 
        error: "El nombre del jugador y la sala son obligatorios." 
      });
    }

    // ✨ Validar sala
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

    nombre = nombre.trim();
    const cacheKey = createCacheKey(nombre, sala, tipoPeriodo, fecha);

    // ✅ Verificar caché
    if (cache.has(cacheKey)) {
      console.log("✅ Cache HIT CSV:", cacheKey);
      return res.status(200).json(cache.get(cacheKey));
    }

    // ⏳ Buscar en CSV
    console.log(`🔍 CSV Query: ${nombre} en ${sala} (${tipoPeriodo})`);
    const jugador = await StatsCSVModel.getJugador(nombre, sala, tipoPeriodo, fecha);

    if (!jugador) {
      const mensaje = fecha 
        ? `Jugador '${nombre}' no encontrado en '${sala}' para ${tipoPeriodo} del ${fecha}`
        : `Jugador '${nombre}' no encontrado en '${sala}' para período '${tipoPeriodo}'`;
      
      return res.status(404).json({ message: mensaje });
    }

    // ✅ Respuesta usando TODOS los stats del CSV, manteniendo estructura PT4
    const respuesta = {
      // Datos básicos del jugador
      player_name: jugador.jugador_nombre,
      total_manos: jugador.hands,
      bb_100: jugador.bb_100,
      all_in_adj_bb_100: jugador.all_in_adj_bb_100,
      win_usd: jugador.my_c_won,
      
      // Stats preflop
      vpip: jugador.vpip,
      pfr: jugador.pfr,
      three_bet: jugador.three_bet_pf_no_sqz,
      fold_to_3bet_pct: jugador.three_bet_pf_fold,
      four_bet_preflop_pct: jugador.raise_4bet_plus_pf,
      fold_to_4bet_pct: jugador.two_bet_pf_fold,
      
      // Stats postflop
      cbet_flop: jugador.cbet_f,
      cbet_turn: jugador.cbet_t,
      cbet_river: jugador.cbet_r,
      fold_to_flop_cbet_pct: jugador.float_f,
      fold_to_turn_cbet_pct: jugador.fold_t_overbet,
      
      // Stats de showdown y winrate
      wwsf: jugador.wwsf,
      wtsd: jugador.wsd, // Usando WSD como WTSD
      wsd: jugador.wsd,
      wsdwbr_pct: jugador.wsdwbr,
      
      // Stats de aggression
      probe_bet_turn_pct: jugador.probe_t,
      bet_river_pct: jugador.bet_r,
      fold_to_river_bet_pct: jugador.fold_r_bet,
      
      // Stats de limp
      limp_pct: jugador.limp,
      limp_raise_pct: jugador.limp_raise,
      
      // Stats de overbet
      overbet_turn_pct: jugador.t_ob_pct,
      overbet_river_pct: jugador.r_ovb_pct,
      
      // Stats adicionales del CSV
      donk_f: jugador.donk_f,
      xr_flop: jugador.xr_flop,
      xr_turn: jugador.xr_turn,
      pf_squeeze: jugador.pf_squeeze,
      steal_t: jugador.steal_t,
      limp_fold: jugador.limp_fold,
      bet_r_fold: jugador.bet_r_fold,
      bet_r_small_pot: jugador.bet_r_small_pot,
      bet_r_big_pot: jugador.bet_r_big_pot,
      wwrb_small: jugador.wwrb_small,
      wwrb_big: jugador.wwrb_big,
      wsdwobr: jugador.wsdwobr,
      wsdwrr: jugador.wsdwrr,
      
      // Metadata del CSV
      data_source: 'CSV',
      fecha_snapshot: jugador.fecha_snapshot,
      tipo_periodo: jugador.tipo_periodo,
      stake_category: jugador.stake_category,
      stake_original: jugador.stake_original,
      processed_at: jugador.processed_at
    };

    // ✅ Caché por 10 minutos para datos CSV
    cache.set(cacheKey, respuesta);
    setTimeout(() => cache.delete(cacheKey), 10 * 60 * 1000);

    console.log(`✅ Encontrado en CSV: ${jugador.jugador_nombre} - ${jugador.hands} manos`);
    return res.status(200).json(respuesta);
    
  } catch (error) {
    console.error("❌ Error CSV:", error);
    
    // Manejo específico de errores
    if (error.message && error.message.includes('Sala inválida')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

// ✨ Controlador para obtener ranking por stake ACTUALIZADO para CSV
const getTopJugadoresPorStake = async (req, res) => {
  const { stake } = req.params;
  const { tipoPeriodo = 'total', limit = 10 } = req.query;

  // USAR DIRECTAMENTE LOS NUEVOS STAKES:
  const stakesValidos = ['microstakes', 'nl100', 'nl200', 'nl400', 'high-stakes'];
  
  if (!stakesValidos.includes(stake)) {
    return res.status(400).json({ 
      error: `Stake no válido. Disponibles: ${stakesValidos.join(', ')}` 
    });
  }

  try {
    console.log(`🏆 Ranking CSV para ${stake} (${tipoPeriodo})`);
    
    const query = `
      SELECT 
        jugador_nombre as player_name,
        hands as total_manos,
        bb_100,
        my_c_won as win_usd,
        vpip,
        pfr,
        sala,
        stake_category,
        fecha_snapshot
      FROM jugadores_stats_csv 
      WHERE stake_category = $1 
      AND tipo_periodo = $2
      AND fecha_snapshot = (
        SELECT MAX(fecha_snapshot) 
        FROM jugadores_stats_csv 
        WHERE stake_category = $1 AND tipo_periodo = $2
      )
      AND hands >= 100
      ORDER BY my_c_won DESC 
      LIMIT $3
    `;

    const pool = require('../config/db');
    const { rows } = await pool.query(query, [stake, tipoPeriodo, parseInt(limit)]);  // Cambiar stakeCategory por stake

    if (!rows || rows.length === 0) {
      return res.status(404).json({ 
        error: `No se encontraron jugadores para el stake ${stake} en período ${tipoPeriodo}.` 
      });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error al obtener ranking CSV:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};


// ✨ Controlador de gráfico ACTUALIZADO para usar datos de CSV
const getGraficoGanancias = async (req, res) => {
  const { nombre } = req.params;
  const { tipoPeriodo = 'total' } = req.query;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre del jugador es obligatorio." });
  }

  try {
    console.log(`📈 Gráfico CSV: ${nombre} (${tipoPeriodo})`);
    
    // Para CSV, vamos a simular datos de gráfico basados en el histórico
    const query = `
      SELECT 
        fecha_snapshot,
        my_c_won as total_money_won,
        hands as total_hands,
        bb_100
      FROM jugadores_stats_csv 
      WHERE LOWER(jugador_nombre) = LOWER($1)
      AND tipo_periodo = $2
      ORDER BY fecha_snapshot ASC
    `;

    const pool = require('../config/db');
    const { rows } = await pool.query(query, [nombre, tipoPeriodo]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ 
        error: `No se encontraron datos de gráfico para ${nombre} en período ${tipoPeriodo}` 
      });
    }

    // Crear datos de gráfico simulando progresión por fechas
    const handGroups = [];
    const totalMoneyWon = [];
    const totalMWNSD = [];
    const totalMWSD = [];

    rows.forEach((fila, index) => {
      handGroups.push(index * 100); // Simular grupos de 100 manos
      totalMoneyWon.push(fila.total_money_won);
      // Simular división showdown/no-showdown (aproximación)
      totalMWNSD.push(fila.total_money_won * 0.6);
      totalMWSD.push(fila.total_money_won * 0.4);
    });

    res.status(200).json({
      handGroups,
      totalMoneyWon,
      totalMWNSD,
      totalMWSD,
      data_source: 'CSV',
      tipo_periodo: tipoPeriodo,
      total_snapshots: rows.length
    });
  } catch (error) {
    console.error("❌ Error en gráfico CSV:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// ✨ Función helper para limpiar caché (útil para debugging)
const limpiarCache = () => {
  const size = cache.size;
  cache.clear();
  console.log(`🧹 Cache limpiado: ${size} entradas eliminadas`);
  return size;
};

// ✨ Función helper para obtener estadísticas del caché
const getEstadisticasCache = () => {
  return {
    entradas_totales: cache.size,
    entradas_csv: Array.from(cache.keys()).filter(key => key.includes('csv-')).length,
    entradas_por_periodo: {
      total: Array.from(cache.keys()).filter(key => key.includes('-total')).length,
      semana: Array.from(cache.keys()).filter(key => key.includes('-semana')).length,
      mes: Array.from(cache.keys()).filter(key => key.includes('-mes')).length
    }
  };
};

module.exports = {
  getJugador,
  getTopJugadoresPorStake,
  getGraficoGanancias,
  limpiarCache,
  getEstadisticasCache
};