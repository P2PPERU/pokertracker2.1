require("dotenv").config();
const { OpenAI } = require("openai");
const db = require("../config/db");

// 📌 Configurar OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✨ Función helper para construir filtros de fecha usando PT4
const buildDateFilter = (fechaDesde, fechaHasta) => {
  if (fechaDesde && fechaHasta) {
    return `AND chps.date_played BETWEEN '${fechaDesde}'::date AND '${fechaHasta}'::date`;
  }
  return '';
};

// ✨ Función principal ACTUALIZADA con CNP, PM y filtros de fecha
const getJugadorData = async (nombre, sala, fechaDesde = null, fechaHasta = null) => {
  
  // ✨ Validar que la sala sea una de las 5 disponibles
  const salasValidas = ['XPK', 'PPP', 'SUP', 'CNP', 'PM'];
  if (!salasValidas.includes(sala)) {
    throw new Error(`Sala inválida. Salas disponibles: ${salasValidas.join(', ')}`);
  }

  // ✨ Construir filtro de fecha usando date_played de PT4
  const dateFilter = buildDateFilter(fechaDesde, fechaHasta);
  
  // 🎯 Consulta SQL que aprovecha PT4 + filtros de fecha
  const selectQuery = `
   SELECT 
  p.id_player,
  p.player_name,
  ARRAY_AGG(DISTINCT cl.limit_name) AS stakes_jugados,
  COUNT(chps.id_hand) AS total_manos,
  ROUND(SUM(chps.amt_won) / COUNT(chps.id_hand) * 100, 2) AS bb_100,
  ROUND(SUM(chps.amt_won), 2) AS win_usd,
  ROUND(AVG(CASE WHEN chps.flg_vpip = TRUE THEN 1 ELSE 0 END) * 100, 2) AS vpip,
  ROUND(AVG(CASE WHEN chps.cnt_p_raise > 0 THEN 1 ELSE 0 END) * 100, 2) AS pfr,

  -- 📌 Three Bet %
  ROUND(AVG(CASE WHEN chps.flg_p_3bet = TRUE THEN 1 ELSE 0 END) / NULLIF(AVG(CASE WHEN chps.flg_p_3bet_opp = TRUE THEN 1 ELSE 0 END), 0) * 100, 2) AS three_bet,

  -- 📌 Fold to 3-Bet %
  ROUND(
    (SUM(CASE WHEN chps.flg_p_fold = TRUE AND chps.flg_p_3bet_def_opp = TRUE AND chps.flg_p_first_raise = TRUE AND NOT chps.flg_p_limp AND NOT chps.flg_p_ccall THEN 1 ELSE 0 END) * 100.0)
    /
    NULLIF(SUM(CASE WHEN chps.flg_p_3bet_def_opp = TRUE AND chps.flg_p_first_raise = TRUE AND NOT chps.flg_p_limp AND NOT chps.flg_p_ccall THEN 1 ELSE 0 END), 0), 2
  ) AS fold_to_3bet_pct,

  -- 📌 4-Bet Ratio
  ROUND(100.0 * SUM(CASE WHEN chps.flg_p_4bet = TRUE THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN chps.flg_p_4bet_opp = TRUE THEN 1 ELSE 0 END), 0), 2) AS four_bet_preflop_pct,

  -- 📌 Fold to 4-Bet %
  ROUND(100.0 * 
    (SUM(CASE WHEN chps.flg_p_4bet_def_opp = TRUE AND chps.flg_p_fold = TRUE THEN 1 ELSE 0 END) +
     SUM(CASE WHEN chps.flg_f_4bet_def_opp = TRUE AND chps.flg_f_fold = TRUE THEN 1 ELSE 0 END) +
     SUM(CASE WHEN chps.flg_t_4bet_def_opp = TRUE AND chps.flg_t_fold = TRUE THEN 1 ELSE 0 END) +
     SUM(CASE WHEN chps.flg_r_4bet_def_opp = TRUE AND chps.flg_r_fold = TRUE THEN 1 ELSE 0 END))
  /
  NULLIF(
    SUM(CASE WHEN chps.flg_p_4bet_def_opp = TRUE THEN 1 ELSE 0 END) +
    SUM(CASE WHEN chps.flg_f_4bet_def_opp = TRUE THEN 1 ELSE 0 END) +
    SUM(CASE WHEN chps.flg_t_4bet_def_opp = TRUE THEN 1 ELSE 0 END) +
    SUM(CASE WHEN chps.flg_r_4bet_def_opp = TRUE THEN 1 ELSE 0 END), 0), 2) AS fold_to_4bet_pct,

  -- 📌 CBet Flop %
  ROUND(AVG(CASE WHEN chps.flg_f_cbet = TRUE THEN 1 ELSE 0 END) / NULLIF(AVG(CASE WHEN chps.flg_f_cbet_opp = TRUE THEN 1 ELSE 0 END), 0) * 100, 2) AS cbet_flop,

  -- 📌 CBet Turn %
  ROUND(AVG(CASE WHEN chps.flg_t_cbet = TRUE THEN 1 ELSE 0 END) / NULLIF(AVG(CASE WHEN chps.flg_t_cbet_opp = TRUE THEN 1 ELSE 0 END), 0) * 100, 2) AS cbet_turn,

  -- 📌 WWSF
  ROUND(AVG(CASE WHEN chps.flg_f_saw = TRUE THEN chps.flg_won_hand::int ELSE NULL END) * 100, 2) AS wwsf,

  -- 📌 WTSD
  ROUND(AVG(CASE WHEN chps.flg_f_saw = TRUE THEN chps.flg_showdown::int ELSE NULL END) * 100, 2) AS wtsd,

  -- 📌 WSD
  ROUND(AVG(CASE WHEN chps.flg_showdown = TRUE THEN chps.flg_won_hand::int ELSE NULL END) * 100, 2) AS wsd,

  -- 📌 Limp %
  COUNT(CASE WHEN chps.flg_p_limp = TRUE THEN 1 END) AS total_limp_preflop,
  COUNT(CASE WHEN NOT chps.flg_blind_b AND NOT chps.flg_p_face_raise THEN 1 END) AS total_oportunidades_limp,
  ROUND(
      COUNT(CASE WHEN chps.flg_p_limp = TRUE THEN 1 END) * 100.0 /
      NULLIF(COUNT(CASE WHEN NOT chps.flg_blind_b AND NOT chps.flg_p_face_raise THEN 1 END), 0),
      2
  ) AS limp_pct,

  -- 📌 Limp-Raise %
  ROUND(100.0 * SUM(CASE WHEN chps.flg_p_limp = TRUE AND chps.cnt_p_raise > 0 THEN 1 ELSE 0 END) 
  / NULLIF(SUM(CASE WHEN chps.flg_p_limp = TRUE THEN 1 ELSE 0 END), 0), 2) AS limp_raise_pct,

  -- 📌 Fold to Flop CBet %
  ROUND(100.0 * SUM(CASE WHEN chps.flg_f_cbet_def_opp = TRUE AND chps.flg_f_fold = TRUE THEN 1 ELSE 0 END)
  / NULLIF(SUM(CASE WHEN chps.flg_f_cbet_def_opp = TRUE THEN 1 ELSE 0 END), 0), 2) AS fold_to_flop_cbet_pct,

  -- 📌 Probe Bet Turn %
  ROUND(
    COALESCE(
      (CAST(SUM(CASE 
        WHEN chps.flg_t_bet = TRUE AND chps.flg_t_open_opp = TRUE AND chps.flg_f_check = TRUE AND chps.flg_f_cbet_opp = TRUE THEN 1 ELSE 0 END) AS NUMERIC)  
      / 
      NULLIF(CAST(SUM(CASE 
        WHEN chps.flg_t_open_opp = TRUE AND chps.flg_f_check = TRUE AND chps.flg_f_cbet_opp = TRUE THEN 1 ELSE 0 END) AS NUMERIC), 0) * 100),
    0.00), 2) AS probe_bet_turn_pct,

  -- 📌 Bet River %
  ROUND(100.0 * SUM(CASE WHEN chps.flg_r_bet = TRUE THEN 1 ELSE 0 END) 
  / NULLIF(SUM(CASE WHEN chps.flg_r_bet = TRUE OR chps.flg_r_check = TRUE THEN 1 ELSE 0 END), 0), 2) AS bet_river_pct,

  -- 📌 Fold to Turn CBet %
  ROUND(100.0 * SUM(CASE WHEN chps.flg_t_cbet_def_opp = TRUE AND chps.flg_t_fold = TRUE THEN 1 ELSE 0 END)
  / NULLIF(SUM(CASE WHEN chps.flg_t_cbet_def_opp = TRUE THEN 1 ELSE 0 END), 0), 2) AS fold_to_turn_cbet_pct,

  -- 📌 Fold to River Bet %
  ROUND(100.0 * SUM(CASE WHEN COALESCE(chps.amt_r_bet_facing, 0) > 0 AND chps.flg_r_fold IS TRUE THEN 1 ELSE 0 END)
  / NULLIF(SUM(CASE WHEN COALESCE(chps.amt_r_bet_facing, 0) > 0 THEN 1 ELSE 0 END), 0), 2) AS fold_to_river_bet_pct,

  -- 📌 Overbet Turn %
  ROUND(100.0 * SUM(CASE 
      WHEN chps.flg_t_bet = TRUE AND chps.amt_t_bet_facing = 0.00 AND chps.amt_t_bet_made > chs.amt_pot_t THEN 1 ELSE 0 END) 
  / NULLIF(SUM(CASE WHEN chps.flg_t_bet = TRUE THEN 1 ELSE 0 END), 0), 2) AS overbet_turn_pct,

  -- 📌 Overbet River %
  ROUND(100.0 * SUM(CASE 
      WHEN chps.flg_r_bet = TRUE AND chps.amt_r_bet_facing = 0.00 AND chps.amt_r_bet_made > chs.amt_pot_r THEN 1 ELSE 0 END) 
  / NULLIF(SUM(CASE WHEN chps.flg_r_bet = TRUE THEN 1 ELSE 0 END), 0), 2) AS overbet_river_pct,

  -- 📌 WSDWBR
  ROUND(100.0 * 
    SUM(CASE WHEN (chps.flg_r_bet = TRUE OR chps.flg_r_check_raise = TRUE) 
             AND chps.flg_showdown = TRUE 
             AND chps.flg_won_hand = TRUE THEN 1 ELSE 0 END)
  / NULLIF(SUM(CASE WHEN (chps.flg_r_bet = TRUE OR chps.flg_r_check_raise = TRUE) 
                    AND chps.flg_showdown = TRUE THEN 1 ELSE 0 END), 0), 2) AS wsdwbr_pct,

  -- ✨ Información del período analizado (usando PT4)
  MIN(chps.date_played) AS fecha_primera_mano,
  MAX(chps.date_played) AS fecha_ultima_mano

FROM player p
JOIN cash_hand_player_statistics chps ON p.id_player = chps.id_player
JOIN lookup_sites s ON p.id_site = s.id_site
JOIN cash_limit cl ON chps.id_limit = cl.id_limit
JOIN cash_hand_summary chs ON chps.id_hand = chs.id_hand
WHERE p.player_name ILIKE $1 
  AND s.site_abbrev = $2
  ${dateFilter}  -- ✨ Filtro de fecha dinámico usando PT4
GROUP BY p.id_player, p.player_name, s.site_name
HAVING COUNT(chps.id_hand) > 0
ORDER BY total_manos DESC
LIMIT 1;
  `;
  
  try {
    const tipoFiltro = dateFilter ? ` (${fechaDesde} - ${fechaHasta})` : '';
    console.log(`🔍 PT4 Query: ${nombre} en ${sala}${tipoFiltro}`);
    
    // 🧠 Búsqueda exacta (case-insensitive)
    const exactResult = await db.query(selectQuery, [nombre, sala]);
    if (exactResult.rows.length > 0) {
      console.log(`✅ Encontrado: ${exactResult.rows[0].player_name} - ${exactResult.rows[0].total_manos} manos`);
      return exactResult.rows[0];
    }

    // 🔐 Búsqueda parcial solo si no hay filtros de fecha (para performance)
    if (!dateFilter) {
      const caracteresEspeciales = /[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]/;
      if (!caracteresEspeciales.test(nombre)) {
        // Búsqueda parcial
        const partialQuery = selectQuery.replace("p.player_name ILIKE $1", "p.player_name ILIKE $1");
        const partialResult = await db.query(partialQuery, [`%${nombre}%`, sala]);
        
        if (partialResult.rows.length > 0) {
          console.log(`✅ Encontrado (parcial): ${partialResult.rows[0].player_name}`);
          return partialResult.rows[0];
        }
      }
    }

    console.log(`❌ No encontrado: ${nombre} en ${sala}${tipoFiltro}`);
    return null;
    
  } catch (error) {
    console.error("❌ Error en consulta PT4:", error);
    throw error;
  }
};

// ✨ Análisis IA ACTUALIZADO con filtros de fecha
const interpretarJugadorData = async (nombre, sala, fechaDesde = null, fechaHasta = null) => {
  const jugador = await getJugadorData(nombre, sala, fechaDesde, fechaHasta);
  if (!jugador) {
    return { error: "Jugador no encontrado" };
  }

  // Determinar el contexto temporal
  const periodoInfo = fechaDesde && fechaHasta 
    ? `para el período ${fechaDesde} a ${fechaHasta}`
    : 'en su historial completo';

  const gap = jugador.vpip - jugador.pfr;
  const threeBet = jugador.three_bet;
  const limpPct = jugador.limp_pct;

  let gapLabel = '';
  if (gap >= 10 && threeBet < 5 && limpPct > 5) {
    gapLabel = 'gap alto con señales pasivas';
  } else if (gap >= 8) {
    gapLabel = 'gap moderado, no necesariamente pasivo';
  } else {
    gapLabel = 'gap normal';
  }

  const prompt = `
Eres un jugador profesional de cash online. Analiza estadísticas de un oponente ${periodoInfo} y genera un informe corto y accionable.

🎯 Estilo directo, sin relleno. Usa lenguaje real de poker: "LAG", "se frena en turn", "flotar flop", "3B light", etc.

📌 Gap VPIP–PFR detectado: ${gapLabel}
📌 Si tiene menos de 1000 manos, menciona que el sample es bajo.
${fechaDesde && fechaHasta ? '📌 Análisis basado en período específico, puede no reflejar su juego completo.' : ''}

---

🎯 Análisis de ${jugador.player_name} ${periodoInfo}:

1️⃣ Estilo de juego:  
[Descripción en 1-2 líneas]

2️⃣ Errores explotables:  
- [Leak 1]  
- [Leak 2]  
- [Leak 3]

3️⃣ Cómo explotarlo:  
[Ajustes específicos]

---

📊 Stats clave:
- Manos: ${jugador.total_manos}
- BB/100: ${jugador.bb_100}
- VPIP: ${jugador.vpip}% | PFR: ${jugador.pfr}%
- 3-Bet: ${jugador.three_bet}% | Fold to 3-Bet: ${jugador.fold_to_3bet_pct}%
- C-Bet Flop: ${jugador.cbet_flop}% | Turn: ${jugador.cbet_turn}%
- WTSD: ${jugador.wtsd}% | WSD: ${jugador.wsd}%
${fechaDesde && fechaHasta ? `- Período: ${fechaDesde} a ${fechaHasta}` : ''}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 400,
    });

    let analisis = response.choices[0].message.content;
    if (gapLabel === 'gap normal') {
      analisis = analisis.replace(/pasivo/gi, 'equilibrado');
    }

    return { 
      jugador: jugador.player_name, 
      analisis: analisis,
      periodo: fechaDesde && fechaHasta ? { desde: fechaDesde, hasta: fechaHasta } : null
    };
  } catch (error) {
    console.error("❌ Error con OpenAI:", error);
    return { error: "No se pudo generar el análisis" };
  }
};

// ✨ Gráfico de ganancias ACTUALIZADO con filtros de fecha
const obtenerGraficoGanancias = async (nombreJugador, fechaDesde = null, fechaHasta = null) => {
  const dateFilter = buildDateFilter(fechaDesde, fechaHasta);
  
  const query = `
    WITH hands AS (
  SELECT 
    ROW_NUMBER() OVER (ORDER BY chps.date_played) AS hand_number,
    SUM(chps.amt_won) OVER (
      ORDER BY chps.date_played 
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_total,
    SUM(CASE WHEN chps.flg_showdown = false THEN chps.amt_won ELSE 0 END) OVER (
      ORDER BY chps.date_played 
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_nosd,
    SUM(CASE WHEN chps.flg_showdown = true THEN chps.amt_won ELSE 0 END) OVER (
      ORDER BY chps.date_played 
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_sd
  FROM cash_hand_player_statistics chps
  JOIN player p ON chps.id_player = p.id_player
  WHERE p.player_name ILIKE $1
    AND chps.date_played IS NOT NULL
    AND chps.amt_won IS NOT NULL
    ${dateFilter}  -- ✨ Filtro de fecha usando PT4
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

  try {
    const tipoFiltro = dateFilter ? ' con filtro de fecha' : '';
    console.log(`📈 PT4 Gráfico: ${nombreJugador}${tipoFiltro}`);
    const { rows } = await db.query(query, [`%${nombreJugador}%`]);
    return rows;
  } catch (error) {
      console.error("❌ Error en gráfico PT4:", error);
      throw error;
  }
};

// ✨ Sugerencias ACTUALIZADA con nuevas salas
const getJugadorSugerencias = async (query, sala) => {
  // Validar sala
  const salasValidas = ['XPK', 'PPP', 'SUP', 'CNP', 'PM'];
  if (!salasValidas.includes(sala)) {
    return [];
  }

  const sql = `
    SELECT DISTINCT p.player_name 
    FROM player p
    JOIN cash_hand_player_statistics chps ON p.id_player = chps.id_player
    JOIN lookup_sites s ON p.id_site = s.id_site
    WHERE p.player_name ILIKE $1
    AND s.site_abbrev = $2
    LIMIT 10;
  `;

  try {
      console.log(`🔍 Sugerencias PT4: ${query} en ${sala}`);
      const { rows } = await db.query(sql, [`%${query}%`, sala]); 
      return rows; 
  } catch (error) {
      console.error("❌ Error en sugerencias PT4:", error);
      return [];
  }
};

// Función de ranking (sin cambios)
const obtenerTopJugadoresPorStake = async (stakeSeleccionado) => {
    const query = `
        WITH ranked_players AS (
            SELECT 
                REPLACE(LEFT(cl.limit_name, POSITION(' ' IN cl.limit_name) - 1), '$', '')::numeric AS stake,  
                p.id_player,
                p.player_name,
                ROUND(SUM(chps.amt_won), 2) AS win_usd,
                COUNT(chps.id_hand) AS total_manos,
                ROUND(SUM(chps.amt_won) / NULLIF(COUNT(chps.id_hand), 0) * 100, 2) AS bb_100,
                RANK() OVER (PARTITION BY REPLACE(LEFT(cl.limit_name, POSITION(' ' IN cl.limit_name) - 1), '$', '')::numeric 
                             ORDER BY SUM(chps.amt_won) DESC) AS rank_win
            FROM player p
            JOIN cash_hand_player_statistics chps ON p.id_player = chps.id_player
            JOIN cash_limit cl ON chps.id_limit = cl.id_limit
            WHERE REPLACE(LEFT(cl.limit_name, POSITION(' ' IN cl.limit_name) - 1), '$', '')::numeric = $1
            GROUP BY stake, p.id_player, p.player_name
        )
        SELECT * FROM ranked_players 
        WHERE rank_win <= 10
        ORDER BY rank_win ASC;
    `;

    try {
        const result = await db.query(query, [stakeSeleccionado]);
        return result.rows;
    } catch (error) {
        console.error('Error al obtener ranking PT4:', error);
        throw error;
    }
};

module.exports = { 
  getJugadorData, 
  obtenerTopJugadoresPorStake, 
  obtenerGraficoGanancias, 
  interpretarJugadorData, 
  getJugadorSugerencias 
};