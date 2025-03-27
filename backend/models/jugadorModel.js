require("dotenv").config();
const { OpenAI } = require("openai");
const db = require("../config/db");

// 📌 Configurar OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getJugadorData = async (nombre, sala) => {
  // 🎯 SELECT con marcador %%FILTRO%%
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
                    AND chps.flg_showdown = TRUE THEN 1 ELSE 0 END), 0), 2) AS wsdwbr_pct

FROM player p
JOIN cash_hand_player_statistics chps ON p.id_player = chps.id_player
JOIN lookup_sites s ON p.id_site = s.id_site
JOIN cash_limit cl ON chps.id_limit = cl.id_limit
JOIN cash_hand_summary chs ON chps.id_hand = chs.id_hand
WHERE p.player_name ILIKE $1 
  AND s.site_abbrev = $2
GROUP BY p.id_player, p.player_name, s.site_name
ORDER BY total_manos DESC
LIMIT 1;
  `;
  
  try {
    // 🧠 Intento 1: búsqueda exacta (case-insensitive)
    const exactQuery = selectQuery.replace("%%FILTRO%%", "LOWER(p.player_name) = LOWER($1)");
    const exactResult = await db.query(exactQuery, [nombre, sala]);
    if (exactResult.rows.length > 0) return exactResult.rows[0];

    // 🔐 Detectar si hay caracteres especiales (no hacemos búsqueda parcial si los tiene)
    const caracteresEspeciales = /[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]/;
    if (caracteresEspeciales.test(nombre)) {
      return null; // No hacemos búsqueda parcial si el nombre tiene símbolos especiales
    }

    // 🕵️ Intento 2: búsqueda parcial
    const partialQuery = selectQuery.replace("%%FILTRO%%", "p.player_name ILIKE $1");
    const partialResult = await db.query(partialQuery, [`%${nombre}%`, sala]);
    return partialResult.rows[0] || null;
  } catch (error) {
    console.error("❌ Error al obtener datos del jugador:", error);
    throw error;
  }
};


// 📌 Función para interpretar los datos con IA
const interpretarJugadorData = async (nombre, sala) => {
  const jugador = await getJugadorData(nombre, sala);
  if (!jugador) {
    return { error: "Jugador no encontrado" };
  }

  // 📌 Cálculo del GAP VPIP - PFR y su interpretación
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

// 📌 Prompt mejorado para análisis de IA
const prompt = `
Eres un jugador profesional de cash online (NL50–NL100). Vas a analizar estadísticas de un oponente y generar un informe **corto, claro y accionable**, como si fuera una nota para otro reg en Discord.

🎯 Estilo directo, sin relleno, sin explicaciones teóricas. Evita tecnicismos largos. Usa lenguaje real de poker: "LAG", "se frena en turn", "flotar flop", "3B light", "spots CO vs BTN", etc.

📌 Evalúa stats **en conjunto**, no por separado. Ejemplos:
- VPIP alto + PFR bajo = pasivo.  
- C-Bet flop alta + Turn baja = agresión inconsistente.  
- WTSD alto + WSD bajo = paga mucho, gana poco.  
- Fold al 3-Bet solo es leak si es >65% o <35%, o no cuadra con su estilo.
📌 Gap VPIP–PFR detectado: ${gapLabel}

📌 Si tiene menos de 1000 manos, di que el sample es bajo y que los reads son preliminares.
❌ No incluyas ninguna lista de estadísticas numéricas al final ni pongas Stats clave. Solo el análisis.

---

📄 FORMATO EXACTO DEL INFORME:

🎯 Informe sobre ${jugador.player_name}:

1️⃣ Estilo de juego:  
[Estilo en 1–2 líneas, con términos comunes entre regs]

2️⃣ Errores explotables:  
- [Leak 1 corto]  
- [Leak 2 corto]  
- [Leak 3 corto]

3️⃣ Cómo explotarlo:  
[Ajustes concisos, estilo "3Btea más en BTN", "flota flop seco", etc.]

---

📊 Stats clave:
- Manos: ${jugador.total_manos}
- BB/100: ${jugador.bb_100}
- Ganancias USD: ${jugador.win_usd}
- VPIP: ${jugador.vpip}%
- PFR: ${jugador.pfr}%
- 3-Bet: ${jugador.three_bet}%
- Fold to 3-Bet: ${jugador.fold_to_3bet_pct}%
- 4-Bet: ${jugador.four_bet_preflop_pct}%
- Fold to 4-Bet: ${jugador.fold_to_4bet_pct}%
- C-Bet Flop: ${jugador.cbet_flop}%
- C-Bet Turn: ${jugador.cbet_turn}%
- WWSF: ${jugador.wwsf}%
- WTSD: ${jugador.wtsd}%
- WSD: ${jugador.wsd}%
- Limp Preflop: ${jugador.total_limp_preflop}/${jugador.total_oportunidades_limp} (${jugador.limp_pct}%)
- Limp-Raise: ${jugador.limp_raise_pct}%
- Fold to Flop C-Bet: ${jugador.fold_to_flop_cbet_pct}%
- Fold to Turn C-Bet: ${jugador.fold_to_turn_cbet_pct}%
- Probe Bet Turn: ${jugador.probe_bet_turn_pct}%
-Fold to River Bet: ${jugador.fold_to_river_bet_pct}%
- Bet River: ${jugador.bet_river_pct}%
- Overbet Turn: ${jugador.overbet_turn_pct}%
- Overbet River: ${jugador.overbet_river_pct}%
- WSDwBR: ${jugador.wsdwbr_pct}%
`;

  // 📌 Enviar el mensaje a OpenAI
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 350,
    });

    let analisis = response.choices[0].message.content;

// Si el gap es normal, eliminamos menciones a "pasivo"
if (gapLabel === 'gap normal') {
  analisis = analisis.replace(/pasivo/gi, 'equilibrado');
}

    return { jugador: jugador.player_name, analisis: response.choices[0].message.content };
  } catch (error) {
    console.error("❌ Error con OpenAI:", error);
    return { error: "No se pudo generar el análisis" };
  }
};

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
                             ORDER BY SUM(chps.amt_won) DESC) AS rank_win,
                RANK() OVER (PARTITION BY REPLACE(LEFT(cl.limit_name, POSITION(' ' IN cl.limit_name) - 1), '$', '')::numeric 
                             ORDER BY SUM(chps.amt_won) ASC) AS rank_loss
            FROM player p
            JOIN cash_hand_player_statistics chps ON p.id_player = chps.id_player
            JOIN cash_limit cl ON chps.id_limit = cl.id_limit
            WHERE REPLACE(LEFT(cl.limit_name, POSITION(' ' IN cl.limit_name) - 1), '$', '')::numeric = $1 -- 🔹 FILTRO DENTRO DEL CTE
            GROUP BY stake, p.id_player, p.player_name
        )
        SELECT * FROM ranked_players 
        WHERE rank_win <= 10
        ORDER BY rank_win ASC;
    `;

    try {
        const result = await db.query(query, [stakeSeleccionado]); // 🔹 Usa el parámetro correctamente
        return result.rows;
    } catch (error) {
        console.error('Error al obtener los jugadores por stake:', error);
        throw error;
    }
};

const obtenerGraficoGanancias = async (nombreJugador) => {
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

  try {
    const { rows } = await db.query(query, [`%${nombreJugador}%`]);
    return rows;
  } catch (error) {
      console.error("❌ Error al obtener el gráfico de ganancias:", error);
      throw error;
  }
};

const getJugadorSugerencias = async (query) => {
  const sql = `
    SELECT DISTINCT p.player_name 
    FROM player p
    JOIN cash_hand_player_statistics chps ON p.id_player = chps.id_player
    WHERE p.player_name ILIKE $1
    LIMIT 10;
  `;

  try {
      const { rows } = await db.query(sql, [`%${query}%`]); // 🔹 Aquí pasamos el parámetro correctamente
      return rows; 
  } catch (error) {
      console.error("❌ Error al obtener sugerencias de jugadores:", error);
      return [];
  }
};

module.exports = { getJugadorData, obtenerTopJugadoresPorStake, obtenerGraficoGanancias, interpretarJugadorData, getJugadorSugerencias };
