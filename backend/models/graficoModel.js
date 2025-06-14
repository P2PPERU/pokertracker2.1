// backend/models/graficoModel.js (ACTUALIZADO)
const db = require("../config/db");
const GraficoPrecalculadoModel = require('./graficoPrecalculadoModel');

// Modelo específico para gráficos usando el query original de PostgreSQL
const GraficoModel = {
  // Obtener datos del gráfico - PRIMERO intenta pre-calculados, luego query en vivo
  obtenerGraficoGanancias: async (nombreJugador) => {
    try {
      // PRIMERO: Intentar obtener datos pre-calculados
      console.log(`🔍 Buscando gráfico pre-calculado para ${nombreJugador}...`);
      const preCalculated = await GraficoPrecalculadoModel.getPreCalculatedGraph(nombreJugador);
      
      if (preCalculated && preCalculated.data.length > 0) {
        console.log(`✅ Gráfico pre-calculado encontrado: ${preCalculated.data.length} puntos`);
        return preCalculated.data;
      }
      
      // SEGUNDO: Si no hay datos pre-calculados, ejecutar query en vivo
      console.log(`⏳ No hay datos pre-calculados, ejecutando query en vivo...`);
      
      const query = `
        WITH hands AS (
          SELECT 
            ROW_NUMBER() OVER (ORDER BY chps.date_played) AS hand_number,
            -- Ganancia total
            SUM(chps.amt_won) OVER (
              ORDER BY chps.date_played 
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS cumulative_total,
            -- Ganancia sin showdown
            SUM(CASE WHEN chps.flg_showdown = false THEN chps.amt_won ELSE 0 END) OVER (
              ORDER BY chps.date_played 
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS cumulative_nosd,
            -- Ganancia con showdown
            SUM(CASE WHEN chps.flg_showdown = true THEN chps.amt_won ELSE 0 END) OVER (
              ORDER BY chps.date_played 
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS cumulative_sd
          FROM cash_hand_player_statistics chps
          JOIN player p ON chps.id_player = p.id_player
          WHERE p.player_name ILIKE $1
            AND chps.date_played IS NOT NULL
            AND chps.amt_won IS NOT NULL
        )
        SELECT 
          FLOOR(hand_number / 100) * 100 AS hand_group,
          MAX(cumulative_total) AS total_money_won,
          MAX(cumulative_nosd) AS money_won_nosd,
          MAX(cumulative_sd) AS money_won_sd
        FROM hands
        GROUP BY hand_group
        ORDER BY hand_group;
      `;
      
      const { rows } = await db.query(query, [`%${nombreJugador}%`]);
      console.log(`📈 Query en vivo completado: ${rows.length} puntos de datos`);
      return rows;
      
    } catch (error) {
      console.error("❌ Error al obtener el gráfico de ganancias:", error);
      throw error;
    }
  },

  // Verificar si el jugador existe en la base de datos original
  verificarJugadorExiste: async (nombreJugador) => {
    // PRIMERO: Verificar en pre-calculados
    const preCalculated = await GraficoPrecalculadoModel.getPreCalculatedGraph(nombreJugador);
    if (preCalculated) {
      return true;
    }
    
    // SEGUNDO: Verificar en BD original
    const query = `
      SELECT COUNT(*) as count 
      FROM player 
      WHERE player_name ILIKE $1
    `;
    
    try {
      const { rows } = await db.query(query, [`%${nombreJugador}%`]);
      return parseInt(rows[0].count) > 0;
    } catch (error) {
      console.error("❌ Error verificando jugador:", error);
      return false;
    }
  },

  // Obtener información básica del jugador para el gráfico
  obtenerInfoJugadorParaGrafico: async (nombreJugador) => {
    try {
      // PRIMERO: Intentar obtener de pre-calculados
      const preCalculated = await GraficoPrecalculadoModel.getPreCalculatedGraph(nombreJugador);
      if (preCalculated && preCalculated.playerInfo) {
        return preCalculated.playerInfo;
      }
      
      // SEGUNDO: Query en vivo
      const query = `
        SELECT 
          p.player_name,
          COUNT(DISTINCT chps.id_hand) as total_hands,
          SUM(chps.amt_won) as total_winnings,
          MIN(chps.date_played) as first_hand_date,
          MAX(chps.date_played) as last_hand_date
        FROM player p
        JOIN cash_hand_player_statistics chps ON p.id_player = chps.id_player
        WHERE p.player_name ILIKE $1
        GROUP BY p.player_name
      `;
      
      const { rows } = await db.query(query, [`%${nombreJugador}%`]);
      return rows[0] || null;
      
    } catch (error) {
      console.error("❌ Error obteniendo info del jugador:", error);
      return null;
    }
  }
};

module.exports = GraficoModel;