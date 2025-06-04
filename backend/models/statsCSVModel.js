// backend/models/statsCSVModel.js
const pool = require('../config/db');

const StatsCSVModel = {
  // Crear tabla si no existe
  createTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS jugadores_stats_csv (
        id SERIAL PRIMARY KEY,
        fecha_snapshot DATE NOT NULL,
        tipo_periodo VARCHAR(20) NOT NULL,
        sala VARCHAR(10) NOT NULL,
        stake_original VARCHAR(50),
        stake_category VARCHAR(20),
        jugador_nombre VARCHAR(255) NOT NULL,
        
        -- Stats básicas
        site VARCHAR(10),
        all_in_adj_bb_100 DECIMAL(10,2) DEFAULT 0,
        bb_100 DECIMAL(10,2) DEFAULT 0,
        my_c_won DECIMAL(12,2) DEFAULT 0,
        hands INTEGER DEFAULT 0,
        
        -- Stats preflop
        vpip DECIMAL(5,2) DEFAULT 0,
        pfr DECIMAL(5,2) DEFAULT 0,
        three_bet_pf_no_sqz DECIMAL(5,2) DEFAULT 0,
        three_bet_pf_fold DECIMAL(5,2) DEFAULT 0,
        two_bet_pf_fold DECIMAL(5,2) DEFAULT 0,
        raise_4bet_plus_pf DECIMAL(5,2) DEFAULT 0,
        pf_squeeze DECIMAL(5,2) DEFAULT 0,
        
        -- Stats postflop
        donk_f DECIMAL(5,2) DEFAULT 0,
        xr_flop DECIMAL(5,2) DEFAULT 0,
        cbet_f_non_3b_nmw_non_sb_vs_bb DECIMAL(5,2) DEFAULT 0,
        cbet_f_non_3b_nmw DECIMAL(5,2) DEFAULT 0,
        cbet_f DECIMAL(5,2) DEFAULT 0,
        fold_to_f_cbet_non_3b DECIMAL(5,2) DEFAULT 0,
        float_f DECIMAL(5,2) DEFAULT 0,
        cbet_t DECIMAL(5,2) DEFAULT 0,
        cbet_r DECIMAL(5,2) DEFAULT 0,
        
        -- Stats showdown
        wwsf DECIMAL(5,2) DEFAULT 0,
        wsd DECIMAL(5,2) DEFAULT 0,
        wsdwbr DECIMAL(5,2) DEFAULT 0,
        wsdwobr DECIMAL(5,2) DEFAULT 0,
        wsdwrr DECIMAL(5,2) DEFAULT 0,
        wwrb_small DECIMAL(5,2) DEFAULT 0,
        wwrb_big DECIMAL(5,2) DEFAULT 0,
        
        -- Stats turn/river
        probe_t DECIMAL(5,2) DEFAULT 0,
        t_ob_pct DECIMAL(5,2) DEFAULT 0,
        fold_t_overbet DECIMAL(5,2) DEFAULT 0,
        fold_to_t_cbet DECIMAL(5,2) DEFAULT 0,
        fold_r_overbet DECIMAL(5,2) DEFAULT 0,
        steal_t DECIMAL(5,2) DEFAULT 0,
        xr_turn DECIMAL(5,2) DEFAULT 0,
        
        -- Stats limping
        limp_fold DECIMAL(5,2) DEFAULT 0,
        limp DECIMAL(5,2) DEFAULT 0,
        limp_raise DECIMAL(5,2) DEFAULT 0,
        
        -- Stats betting
        bet_r DECIMAL(5,2) DEFAULT 0,
        fold_r_bet DECIMAL(5,2) DEFAULT 0,
        r_ovb_pct DECIMAL(5,2) DEFAULT 0,
        bet_r_fold DECIMAL(5,2) DEFAULT 0,
        bet_r_small_pot DECIMAL(5,2) DEFAULT 0,
        bet_r_big_pot DECIMAL(5,2) DEFAULT 0,
        
        -- Metadata
        hash_datos VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Índice único para evitar duplicados
        UNIQUE(fecha_snapshot, tipo_periodo, sala, jugador_nombre, stake_category)
      );
      
      -- Índices para optimizar búsquedas
      CREATE INDEX IF NOT EXISTS idx_jugadores_stats_csv_search 
        ON jugadores_stats_csv (sala, jugador_nombre, stake_category);
      CREATE INDEX IF NOT EXISTS idx_jugadores_stats_csv_fecha 
        ON jugadores_stats_csv (fecha_snapshot, tipo_periodo);
      CREATE INDEX IF NOT EXISTS idx_jugadores_stats_csv_hands 
        ON jugadores_stats_csv (hands DESC);
    `;
    
    await pool.query(query);
  },

  // Mapear sala desde el CSV
  mapSala: (site) => {
    const salaMap = {
      'XPK': 'XPK',
      'PPP': 'PPP', 
      'PM': 'PM',
      'ClubGG': 'PM' // ClubGG se mapea a PM
    };
    
    return salaMap[site] || site;
  },

  // Insertar/actualizar batch de jugadores
  upsertBatch: async (fechaSnapshot, tipoPeriodo, jugadores) => {
    if (!jugadores || jugadores.length === 0) return { insertados: 0, actualizados: 0 };

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let insertados = 0;
      let actualizados = 0;

      for (const jugador of jugadores) {
        const query = `
          INSERT INTO jugadores_stats_csv (
            fecha_snapshot, tipo_periodo, sala, stake_original, stake_category, jugador_nombre,
            site, all_in_adj_bb_100, bb_100, my_c_won, hands,
            vpip, pfr, three_bet_pf_no_sqz, three_bet_pf_fold, two_bet_pf_fold,
            raise_4bet_plus_pf, pf_squeeze, donk_f, xr_flop, cbet_f_non_3b_nmw_non_sb_vs_bb,
            cbet_f_non_3b_nmw, cbet_f, fold_to_f_cbet_non_3b, float_f, cbet_t, cbet_r, wwsf, wsd, probe_t,
            t_ob_pct, fold_t_overbet, fold_to_t_cbet, fold_r_overbet, steal_t, xr_turn, limp_fold,
            limp, limp_raise, bet_r, fold_r_bet, wsdwbr, r_ovb_pct, wsdwobr,
            wsdwrr, bet_r_fold, bet_r_small_pot, wwrb_small, bet_r_big_pot, wwrb_big,
            hash_datos, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
            $45, $46, $47, $48, $49, $50, $51, CURRENT_TIMESTAMP
          )
          ON CONFLICT (fecha_snapshot, tipo_periodo, sala, jugador_nombre, stake_category)
          DO UPDATE SET
            stake_original = EXCLUDED.stake_original,
            site = EXCLUDED.site,
            all_in_adj_bb_100 = EXCLUDED.all_in_adj_bb_100,
            bb_100 = EXCLUDED.bb_100,
            my_c_won = EXCLUDED.my_c_won,
            hands = EXCLUDED.hands,
            vpip = EXCLUDED.vpip,
            pfr = EXCLUDED.pfr,
            three_bet_pf_no_sqz = EXCLUDED.three_bet_pf_no_sqz,
            three_bet_pf_fold = EXCLUDED.three_bet_pf_fold,
            two_bet_pf_fold = EXCLUDED.two_bet_pf_fold,
            raise_4bet_plus_pf = EXCLUDED.raise_4bet_plus_pf,
            pf_squeeze = EXCLUDED.pf_squeeze,
            donk_f = EXCLUDED.donk_f,
            xr_flop = EXCLUDED.xr_flop,
            cbet_f_non_3b_nmw_non_sb_vs_bb = EXCLUDED.cbet_f_non_3b_nmw_non_sb_vs_bb,
            cbet_f_non_3b_nmw = EXCLUDED.cbet_f_non_3b_nmw,
            cbet_f = EXCLUDED.cbet_f,
            fold_to_f_cbet_non_3b = EXCLUDED.fold_to_f_cbet_non_3b,
            float_f = EXCLUDED.float_f,
            cbet_t = EXCLUDED.cbet_t,
            cbet_r = EXCLUDED.cbet_r,
            wwsf = EXCLUDED.wwsf,
            wsd = EXCLUDED.wsd,
            probe_t = EXCLUDED.probe_t,
            t_ob_pct = EXCLUDED.t_ob_pct,
            fold_t_overbet = EXCLUDED.fold_t_overbet,
            fold_to_t_cbet = EXCLUDED.fold_to_t_cbet,
            fold_r_overbet = EXCLUDED.fold_r_overbet,
            steal_t = EXCLUDED.steal_t,
            xr_turn = EXCLUDED.xr_turn,
            limp_fold = EXCLUDED.limp_fold,
            limp = EXCLUDED.limp,
            limp_raise = EXCLUDED.limp_raise,
            bet_r = EXCLUDED.bet_r,
            fold_r_bet = EXCLUDED.fold_r_bet,
            wsdwbr = EXCLUDED.wsdwbr,
            r_ovb_pct = EXCLUDED.r_ovb_pct,
            wsdwobr = EXCLUDED.wsdwobr,
            wsdwrr = EXCLUDED.wsdwrr,
            bet_r_fold = EXCLUDED.bet_r_fold,
            bet_r_small_pot = EXCLUDED.bet_r_small_pot,
            wwrb_small = EXCLUDED.wwrb_small,
            bet_r_big_pot = EXCLUDED.bet_r_big_pot,
            wwrb_big = EXCLUDED.wwrb_big,
            hash_datos = EXCLUDED.hash_datos,
            updated_at = CURRENT_TIMESTAMP
        `;

        const values = [
          fechaSnapshot, tipoPeriodo, jugador.sala, jugador.stake_original, jugador.stake_category,
          jugador.jugador_nombre, jugador.site, jugador.all_in_adj_bb_100, jugador.bb_100,
          jugador.my_c_won, jugador.hands, jugador.vpip, jugador.pfr, jugador.three_bet_pf_no_sqz,
          jugador.three_bet_pf_fold, jugador.two_bet_pf_fold, jugador.raise_4bet_plus_pf,
          jugador.pf_squeeze, jugador.donk_f, jugador.xr_flop, jugador.cbet_f_non_3b_nmw_non_sb_vs_bb,
          jugador.cbet_f_non_3b_nmw, jugador.cbet_f, jugador.fold_to_f_cbet_non_3b || 0, jugador.float_f, jugador.cbet_t,
          jugador.cbet_r, jugador.wwsf, jugador.wsd, jugador.probe_t, jugador.t_ob_pct,
          jugador.fold_t_overbet, jugador.fold_to_t_cbet || 0, jugador.fold_r_overbet, jugador.steal_t, jugador.xr_turn,
          jugador.limp_fold, jugador.limp, jugador.limp_raise, jugador.bet_r, jugador.fold_r_bet,
          jugador.wsdwbr, jugador.r_ovb_pct, jugador.wsdwobr, jugador.wsdwrr, jugador.bet_r_fold,
          jugador.bet_r_small_pot, jugador.wwrb_small, jugador.bet_r_big_pot, jugador.wwrb_big,
          jugador.hash_datos
        ];

        const result = await client.query(query, values);
        
        // No hay forma directa de saber si fue INSERT o UPDATE en PostgreSQL
        // pero podemos asumir que se procesó correctamente
        insertados++;
      }

      await client.query('COMMIT');
      
      console.log(`📊 Procesando lote de ${jugadores.length} jugadores para ${fechaSnapshot} - ${tipoPeriodo}`);
      
      return { insertados, actualizados };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en upsertBatch:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // Obtener dashboard de archivos CSV
  getDashboard: async () => {
    const archivosQuery = `
      SELECT 
        fecha_snapshot,
        tipo_periodo,
        sala,
        stake_category,
        COUNT(*) as total_jugadores,
        COUNT(DISTINCT stake_category) as stakes_diferentes,
        MAX(updated_at) as ultimo_procesamiento
      FROM jugadores_stats_csv 
      GROUP BY fecha_snapshot, tipo_periodo, sala, stake_category
      ORDER BY fecha_snapshot DESC, tipo_periodo, sala
    `;

    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT CONCAT(fecha_snapshot, '-', tipo_periodo, '-', sala)) as total_snapshots,
        COUNT(*) as total_jugadores,
        MAX(fecha_snapshot) as ultima_fecha
      FROM jugadores_stats_csv
    `;

    const [archivosResult, resumenResult] = await Promise.all([
      pool.query(archivosQuery),
      pool.query(resumenQuery)
    ]);

    return {
      archivos_cargados: archivosResult.rows,
      resumen: resumenResult.rows[0]
    };
  },

  // Obtener último snapshot
  getLatestSnapshot: async () => {
    const query = `
      SELECT 
        fecha_snapshot,
        tipo_periodo,
        sala,
        stake_category,
        COUNT(*) as total_jugadores,
        AVG(hands) as promedio_manos,
        MAX(updated_at) as ultimo_procesamiento
      FROM jugadores_stats_csv 
      GROUP BY fecha_snapshot, tipo_periodo, sala, stake_category
      ORDER BY fecha_snapshot DESC, ultimo_procesamiento DESC
      LIMIT 1
    `;

    const result = await pool.query(query);
    return result.rows[0] || null;
  },

  // Buscar jugador por nombre y sala
  buscarJugador: async (nombre, sala, tipoPeriodo = 'total', fecha = null) => {
    let query = `
      SELECT * FROM jugadores_stats_csv 
      WHERE LOWER(jugador_nombre) = LOWER($1) 
      AND sala = $2 
      AND tipo_periodo = $3
    `;
    
    let params = [nombre, sala, tipoPeriodo];
    
    if (fecha) {
      query += ` AND fecha_snapshot = $4`;
      params.push(fecha);
    } else {
      query += ` ORDER BY fecha_snapshot DESC`;
    }
    
    query += ` LIMIT 10`;
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Autocompletar jugadores
  autocomplete: async (query, sala, limite = 10) => {
    const sqlQuery = `
      SELECT DISTINCT jugador_nombre 
      FROM jugadores_stats_csv 
      WHERE LOWER(jugador_nombre) LIKE LOWER($1) 
      AND sala = $2
      ORDER BY jugador_nombre 
      LIMIT $3
    `;
    
    const result = await pool.query(sqlQuery, [`%${query}%`, sala, limite]);
    return result.rows.map(row => row.jugador_nombre);
  },

  // Top jugadores por stake
  getTopJugadores: async (stakeCategory, tipoPeriodo = 'total', limite = 10) => {
    const query = `
      SELECT 
        jugador_nombre,
        stake_original,
        stake_category,
        hands,
        bb_100,
        vpip,
        pfr,
        my_c_won,
        fecha_snapshot
      FROM jugadores_stats_csv 
      WHERE stake_category = $1 
      AND tipo_periodo = $2
      AND hands >= 100
      ORDER BY bb_100 DESC 
      LIMIT $3
    `;
    
    const result = await pool.query(query, [stakeCategory, tipoPeriodo, limite]);
    return result.rows;
  },

  // Obtener jugador específico
  getJugador: async (nombre, sala, tipoPeriodo = 'total', fecha = null) => {
    let query = `
      SELECT * FROM jugadores_stats_csv 
      WHERE LOWER(jugador_nombre) = LOWER($1) 
      AND sala = $2 
      AND tipo_periodo = $3
    `;
    
    let params = [nombre, sala, tipoPeriodo];
    
    if (fecha) {
      query += ` AND fecha_snapshot = $4`;
      params.push(fecha);
    } else {
      query += ` ORDER BY fecha_snapshot DESC`;
    }
    
    query += ` LIMIT 1`;
    
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }
};

module.exports = StatsCSVModel;