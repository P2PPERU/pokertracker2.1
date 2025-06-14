// backend/models/graficoPrecalculadoModel.js
const pool = require('../config/db');

const GraficoPrecalculadoModel = {
  // Obtener gráfico pre-calculado desde la tabla
  getPreCalculatedGraph: async (playerName) => {
    const query = `
      SELECT 
        hand_group,
        total_money_won,
        money_won_nosd,
        money_won_sd,
        total_hands,
        total_winnings,
        first_hand_date,
        last_hand_date
      FROM graficos_precalculados
      WHERE LOWER(player_name) = LOWER($1)
      ORDER BY hand_group
    `;
    
    try {
      const result = await pool.query(query, [playerName]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Extraer info del jugador del primer registro
      const playerInfo = {
        player_name: playerName,
        total_hands: result.rows[0].total_hands,
        total_winnings: result.rows[0].total_winnings,
        first_hand_date: result.rows[0].first_hand_date,
        last_hand_date: result.rows[0].last_hand_date
      };
      
      return {
        data: result.rows,
        playerInfo
      };
    } catch (error) {
      console.error('Error obteniendo gráfico pre-calculado:', error);
      return null;
    }
  }
};

module.exports = GraficoPrecalculadoModel;