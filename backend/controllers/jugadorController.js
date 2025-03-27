const { getJugadorData, obtenerTopJugadoresPorStake, obtenerGraficoGanancias } = require("../models/jugadorModel");

// Controlador para obtener datos de un jugador por nombre
const getJugador = async (req, res) => {
  try {
    let { sala, nombre } = req.params;

    // Validación de parámetros
    if (!nombre || !sala) {
      return res.status(400).json({ error: "El nombre del jugador y la sala son obligatorios." });
    }

    if (!["XPK", "PPP", "SUP"].includes(sala)) {
      return res.status(400).json({ error: "Sala no válida." });
    }

    nombre = nombre.trim();
    const jugador = await getJugadorData(nombre, sala);

    if (!jugador) {
      return res.status(404).json({ message: `Jugador '${nombre}' no encontrado en la sala '${sala}'.` });
    }

    return res.status(200).json({
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
    });
  } catch (error) {
    console.error("Error al obtener datos del jugador:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Controlador para obtener ranking por stake
const getTopJugadoresPorStake = async (req, res) => {
  const { stake } = req.params; // 🔹 Cambiado de req.query a req.params
  const stakeSeleccionado = parseFloat(stake); // 🔹 Convertimos a número

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
      console.error("❌ Error al obtener los jugadores por stake:", error);
      res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Controlador para obtener gráfico de ganancias
const getGraficoGanancias = async (req, res) => {
  const { nombre } = req.params;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre del jugador es obligatorio." });
  }

  try {
    const datos = await obtenerGraficoGanancias(nombre);

    if (!datos || datos.length === 0) {
      return res.status(404).json({ error: `No se encontraron datos de ganancias para el jugador ${nombre}.` });
    }

    const handGroups = [];
    const totalMoneyWon = [];
    const totalMWNSD = [];
    const totalMWSD = []; // 🔹 NUEVO: money won with showdown

    datos.forEach((fila) => {
      handGroups.push(fila.hand_group);
      totalMoneyWon.push(fila.total_money_won);
      totalMWNSD.push(fila.money_won_nosd); // 🔹 Asegúrate que el nombre en el modelo sea correcto
      totalMWSD.push(fila.money_won_sd);    // 🔹 Nuevo
    });

    res.status(200).json({
      handGroups,
      totalMoneyWon,
      totalMWNSD,
      totalMWSD,
    });
  } catch (error) {
    console.error("Error al obtener gráfico de ganancias:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

module.exports = { getJugador, getTopJugadoresPorStake, getGraficoGanancias };