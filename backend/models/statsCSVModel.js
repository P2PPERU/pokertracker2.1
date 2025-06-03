// backend/models/statsCSVModel.js
const pool = require('../config/db');

const StatsCSVModel = {
  // Crear tabla si no existe (para inicialización)
  createTable: async () => {
    // Ya está creada, pero esta función mantiene consistencia con tu patrón
    console.log('✅ Tabla jugadores_stats_csv verificada');
  },

  // Función helper para mapear stakes a categorías
  mapStakeToCategory: (stakeOriginal) => {
    if (!stakeOriginal) return 'unknown';
    
    // Extraer el número principal del stake (ej: "$1 NL", "$2 Ante NL", etc.)
    const match = stakeOriginal.match(/\$(\d+(?:\.\d+)?)/);
    if (!match) return 'unknown';
    
    const stakeValue = parseFloat(match[1]);
    
    if (stakeValue < 1) return 'menor-0.5';
    if (stakeValue === 1) return '0.5-1';
    if (stakeValue === 2) return '1-2';
    if (stakeValue === 4) return '2-4';
    if (stakeValue >= 10) return '5-10';
    
    return 'unknown';
  },

  // Función helper para mapear sala (PM = CLUBGG en CSV)
  mapSala: (siteOriginal) => {
    const salaMap = {
      'XPK': 'XPK',
      'PPP': 'PPP', 
      'PM': 'PM'  // PM en CSV = CLUBGG en realidad
    };
    return salaMap[siteOriginal] || siteOriginal;
  },

  // Insertar/actualizar datos por lotes (batch insert)
  upsertBatch: async (fecha, tipoPeriodo, jugadoresData) => {
    try {
      console.log(`📊 Procesando lote de ${jugadoresData.length} jugadores para ${fecha} - ${tipoPeriodo}`);
      
      const query = `
        INSERT INTO jugadores_stats_csv (
          fecha_snapshot, tipo_periodo, sala, stake_original, stake_category,
          jugador_nombre, hands, all_in_adj_bb_100, bb_100, my_c_won,
          vpip, pfr, three_bet_pf_no_sqz, three_bet_pf_fold, two_bet_pf_fold,
          raise_4bet_plus_pf, pf_squeeze, donk_f, xr_flop, cbet_f_non_3b_nmw_non_sb_vs_bb,
          cbet_f_non_3b_nmw, cbet_f, float_f, cbet_t, cbet_r, wwsf, wsd,
          probe_t, t_ob_pct, fold_t_overbet, fold_r_overbet, steal_t,
          xr_turn, limp_fold, limp, limp_raise, bet_r, fold_r_bet, wsdwbr,
          r_ovb_pct, wsdwobr, wsdwrr, bet_r_fold, bet_r_small_pot,
          wwrb_small, bet_r_big_pot, wwrb_big, hash_datos
        ) VALUES ${jugadoresData.map((_, i) => {
          const offset = i * 48;
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, 
                   $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10},
                   $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15},
                   $${offset + 16}, $${offset + 17}, $${offset + 18}, $${offset + 19}, $${offset + 20},
                   $${offset + 21}, $${offset + 22}, $${offset + 23}, $${offset + 24}, $${offset + 25},
                   $${offset + 26}, $${offset + 27}, $${offset + 28}, $${offset + 29}, $${offset + 30},
                   $${offset + 31}, $${offset + 32}, $${offset + 33}, $${offset + 34}, $${offset + 35},
                   $${offset + 36}, $${offset + 37}, $${offset + 38}, $${offset + 39}, $${offset + 40},
                   $${offset + 41}, $${offset + 42}, $${offset + 43}, $${offset + 44}, $${offset + 45},
                   $${offset + 46}, $${offset + 47}, $${offset + 48})`;
        }).join(',')}
        ON CONFLICT (fecha_snapshot, tipo_periodo, sala, jugador_nombre, stake_category)
        DO UPDATE SET
          hands = EXCLUDED.hands,
          bb_100 = EXCLUDED.bb_100,
          vpip = EXCLUDED.vpip,
          pfr = EXCLUDED.pfr,
          processed_at = NOW()
        RETURNING id
      `;

      const values = jugadoresData.flatMap(jugador => [
        fecha, tipoPeriodo, jugador.sala, jugador.stake_original, jugador.stake_category,
        jugador.jugador_nombre, jugador.hands, jugador.all_in_adj_bb_100, jugador.bb_100, jugador.my_c_won,
        jugador.vpip, jugador.pfr, jugador.three_bet_pf_no_sqz, jugador.three_bet_pf_fold, jugador.two_bet_pf_fold,
        jugador.raise_4bet_plus_pf, jugador.pf_squeeze, jugador.donk_f, jugador.xr_flop, jugador.cbet_f_non_3b_nmw_non_sb_vs_bb,
        jugador.cbet_f_non_3b_nmw, jugador.cbet_f, jugador.float_f, jugador.cbet_t, jugador.cbet_r, jugador.wwsf, jugador.wsd,
        jugador.probe_t, jugador.t_ob_pct, jugador.fold_t_overbet, jugador.fold_r_overbet, jugador.steal_t,
        jugador.xr_turn, jugador.limp_fold, jugador.limp, jugador.limp_raise, jugador.bet_r, jugador.fold_r_bet, jugador.wsdwbr,
        jugador.r_ovb_pct, jugador.wsdwobr, jugador.wsdwrr, jugador.bet_r_fold, jugador.bet_r_small_pot,
        jugador.wwrb_small, jugador.bet_r_big_pot, jugador.wwrb_big, jugador.hash_datos
      ]);

      const result = await pool.query(query, values);
      return result.rows;

    } catch (error) {
      console.error('❌ Error en upsertBatch:', error);
      throw error;
    }
  },

  // Obtener jugador por nombre y filtros
  getJugador: async (nombre, sala, tipoPeriodo = 'total', fecha = null) => {
    try {
      const fechaCondition = fecha ? 'AND fecha_snapshot = $4' : '';
      const query = `
        SELECT * FROM jugadores_stats_csv 
        WHERE LOWER(jugador_nombre) = LOWER($1) 
        AND sala = $2 
        AND tipo_periodo = $3
        ${fechaCondition}
        ORDER BY fecha_snapshot DESC 
        LIMIT 1
      `;
      
      const params = fecha ? [nombre, sala, tipoPeriodo, fecha] : [nombre, sala, tipoPeriodo];
      const result = await pool.query(query, params);
      return result.rows[0] || null;

    } catch (error) {
      console.error('❌ Error en getJugador:', error);
      throw error;
    }
  },

  // Obtener estadísticas del último snapshot cargado
  getLatestSnapshot: async () => {
    try {
      const query = `
        SELECT 
          fecha_snapshot,
          tipo_periodo,
          COUNT(*) as total_jugadores,
          COUNT(DISTINCT sala) as salas_activas,
          MAX(processed_at) as ultimo_procesamiento
        FROM jugadores_stats_csv 
        WHERE fecha_snapshot = (SELECT MAX(fecha_snapshot) FROM jugadores_stats_csv)
        GROUP BY fecha_snapshot, tipo_periodo
        ORDER BY tipo_periodo
      `;
      
      const result = await pool.query(query);
      return result.rows;

    } catch (error) {
      console.error('❌ Error en getLatestSnapshot:', error);
      throw error;
    }
  }
};

module.exports = StatsCSVModel;