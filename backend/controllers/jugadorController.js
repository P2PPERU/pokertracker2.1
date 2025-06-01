const { getJugadorData, obtenerTopJugadoresPorStake, obtenerGraficoGanancias } = require("../models/jugadorModel");

// 🧠 Cache en memoria (simple)
const cache = new Map();

// ✨ Salas válidas ACTUALIZADAS con CNP y PM
const SALAS_VALIDAS = ['XPK', 'PPP', 'SUP', 'CNP', 'PM'];

// ✨ Función helper para crear clave de caché con fechas
const createCacheKey = (nombre, sala, fechaDesde = null, fechaHasta = null) => {
  const baseKey = `${sala}-${nombre}`;
  if (fechaDesde && fechaHasta) {
    return `${baseKey}-${fechaDesde}-${fechaHasta}`;
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

// ✨ Controlador principal ACTUALIZADO con CNP, PM y filtros de fecha
const getJugador = async (req, res) => {
  try {
    let { sala, nombre } = req.params;
    const { fechaDesde, fechaHasta } = req.query; // ✨ Nuevos parámetros de fecha

    // Validaciones básicas
    if (!nombre || !sala) {
      return res.status(400).json({ 
        error: "El nombre del jugador y la sala son obligatorios." 
      });
    }

    // ✨ Validar sala (ahora incluye CNP y PM)
    const validacionSala = validarSala(sala);
    if (!validacionSala.valido) {
      return res.status(400).json({ error: validacionSala.error });
    }

    // ✨ Validar fechas si se proporcionan
    if (fechaDesde || fechaHasta) {
      // Si solo se proporciona una fecha, requerir ambas
      if ((fechaDesde && !fechaHasta) || (!fechaDesde && fechaHasta)) {
        return res.status(400).json({ 
          error: "Se requieren ambas fechas: fechaDesde y fechaHasta" 
        });
      }
      
      const validacion = validarFechas(fechaDesde, fechaHasta);
      if (!validacion.valido) {
        return res.status(400).json({ error: validacion.error });
      }
    }

    nombre = nombre.trim();
    const cacheKey = createCacheKey(nombre, sala, fechaDesde, fechaHasta);

    // ✅ Verificar caché
    if (cache.has(cacheKey)) {
      console.log("✅ Cache HIT PT4:", cacheKey);
      return res.status(200).json(cache.get(cacheKey));
    }

    // ⏳ Buscar en PT4 usando el sistema nativo con filtros de fecha
    const jugador = await getJugadorData(nombre, sala, fechaDesde, fechaHasta);

    if (!jugador) {
      const mensaje = fechaDesde && fechaHasta 
        ? `Jugador '${nombre}' no encontrado en '${sala}' para el período ${fechaDesde} - ${fechaHasta}`
        : `Jugador '${nombre}' no encontrado en '${sala}'`;
      
      return res.status(404).json({ message: mensaje });
    }

    // ✅ Respuesta usando la estructura existente de PT4
    const respuesta = {
      player_name: jugador.player_name,
      total_manos: jugador.total_manos,
      bb_100: jugador.bb_100,
      win_usd: jugador.win_usd,
      vpip: jugador.vpip,
      pfr: jugador.pfr,
      three_bet: jugador.three_bet,
      fold_to_3bet_pct: jugador.fold_to_3bet_pct,
      four_bet_preflop_pct: jugador.four_bet_preflop_pct,
      fold_to_4bet_pct: jugador.fold_to_4bet_pct,
      cbet_flop: jugador.cbet_flop,
      cbet_turn: jugador.cbet_turn,
      wwsf: jugador.wwsf,
      wtsd: jugador.wtsd,
      wsd: jugador.wsd,
      limp_pct: jugador.limp_pct,
      limp_raise_pct: jugador.limp_raise_pct,
      fold_to_flop_cbet_pct: jugador.fold_to_flop_cbet_pct,
      fold_to_turn_cbet_pct: jugador.fold_to_turn_cbet_pct,
      probe_bet_turn_pct: jugador.probe_bet_turn_pct,
      bet_river_pct: jugador.bet_river_pct,
      fold_to_river_bet_pct: jugador.fold_to_river_bet_pct,
      overbet_turn_pct: jugador.overbet_turn_pct,
      overbet_river_pct: jugador.overbet_river_pct,
      wsdwbr_pct: jugador.wsdwbr_pct,
      // ✨ Info del período (usando datos de PT4)
      ...(fechaDesde && fechaHasta && {
        fecha_filtro: {
          desde: fechaDesde,
          hasta: fechaHasta,
          filtrado: true,
          primera_mano: jugador.fecha_primera_mano,
          ultima_mano: jugador.fecha_ultima_mano,
          total_dias: Math.ceil((new Date(fechaHasta) - new Date(fechaDesde)) / (1000 * 60 * 60 * 24))
        }
      })
    };

    // ✅ Caché adaptativo (menos tiempo para filtros de fecha)
    const tiempoCache = (fechaDesde && fechaHasta) ? 2 * 60 * 1000 : 5 * 60 * 1000;
    cache.set(cacheKey, respuesta);
    setTimeout(() => cache.delete(cacheKey), tiempoCache);

    return res.status(200).json(respuesta);
    
  } catch (error) {
    console.error("❌ Error PT4:", error);
    
    // Manejo específico de errores
    if (error.message && error.message.includes('Sala inválida')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Controlador para obtener ranking por stake (sin cambios)
const getTopJugadoresPorStake = async (req, res) => {
  const { stake } = req.params;
  const stakeSeleccionado = parseFloat(stake);

  if (isNaN(stakeSeleccionado) || stakeSeleccionado <= 0) {
    return res.status(400).json({ error: "El stake debe ser un número válido y mayor a 0." });
  }

  try {
    const jugadores = await obtenerTopJugadoresPorStake(stakeSeleccionado);

    if (!jugadores || jugadores.length === 0) {
      return res.status(404).json({ error: `No se encontraron jugadores para el stake ${stakeSeleccionado}.` });
    }

    res.status(200).json(jugadores);
  } catch (error) {
    console.error("❌ Error al obtener ranking PT4:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// ✨ Controlador de gráfico ACTUALIZADO con filtros de fecha
const getGraficoGanancias = async (req, res) => {
  const { nombre } = req.params;
  const { fechaDesde, fechaHasta } = req.query; // ✨ Nuevos parámetros de fecha

  if (!nombre) {
    return res.status(400).json({ error: "El nombre del jugador es obligatorio." });
  }

  // ✨ Validar fechas si se proporcionan
  if (fechaDesde || fechaHasta) {
    if ((fechaDesde && !fechaHasta) || (!fechaDesde && fechaHasta)) {
      return res.status(400).json({ 
        error: "Se requieren ambas fechas: fechaDesde y fechaHasta" 
      });
    }
    
    const validacion = validarFechas(fechaDesde, fechaHasta);
    if (!validacion.valido) {
      return res.status(400).json({ error: validacion.error });
    }
  }

  try {
    const datos = await obtenerGraficoGanancias(nombre, fechaDesde, fechaHasta);

    if (!datos || datos.length === 0) {
      const mensaje = fechaDesde && fechaHasta 
        ? `No se encontraron datos de ganancias para ${nombre} en el período ${fechaDesde} - ${fechaHasta}`
        : `No se encontraron datos de ganancias para ${nombre}`;
      
      return res.status(404).json({ error: mensaje });
    }

    const handGroups = [];
    const totalMoneyWon = [];
    const totalMWNSD = [];
    const totalMWSD = [];

    datos.forEach((fila) => {
      handGroups.push(fila.hand_group);
      totalMoneyWon.push(fila.total_money_won);
      totalMWNSD.push(fila.money_won_nosd);
      totalMWSD.push(fila.money_won_sd);
    });

    res.status(200).json({
      handGroups,
      totalMoneyWon,
      totalMWNSD,
      totalMWSD,
      // ✨ Info del filtro aplicado
      ...(fechaDesde && fechaHasta && {
        fecha_filtro: {
          desde: fechaDesde,
          hasta: fechaHasta,
          filtrado: true,
          total_puntos: datos.length
        }
      })
    });
  } catch (error) {
    console.error("❌ Error en gráfico PT4:", error);
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
    entradas_con_fecha: Array.from(cache.keys()).filter(key => key.includes('-2')).length,
    entradas_sin_fecha: Array.from(cache.keys()).filter(key => !key.includes('-2')).length
  };
};

module.exports = {
  getJugador,
  getTopJugadoresPorStake,
  getGraficoGanancias,
  limpiarCache,        // ✨ Nueva función de utilidad
  getEstadisticasCache // ✨ Nueva función de utilidad
};