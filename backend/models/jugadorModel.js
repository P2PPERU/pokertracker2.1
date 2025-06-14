require("dotenv").config();
const { OpenAI } = require("openai");
const StatsCSVModel = require("./statsCSVModel");
const db = require("../config/db");

// 📌 Configurar OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✨ Análisis IA ACTUALIZADO con TODOS los stats para mejor análisis
const interpretarJugadorData = async (nombre, sala, tipoPeriodo = 'total', fecha = null) => {
  const jugador = await StatsCSVModel.getJugador(nombre, sala, tipoPeriodo, fecha);
  if (!jugador) {
    return { error: "Jugador no encontrado" };
  }

  // Determinar el contexto temporal
  const periodoInfo = tipoPeriodo === 'total' ? 'en su historial completo' : 
                     tipoPeriodo === 'semana' ? 'en la última semana' :
                     tipoPeriodo === 'mes' ? 'en el último mes' : `para ${tipoPeriodo}`;

  const gap = jugador.vpip - jugador.pfr;
  const threeBet = jugador.three_bet_pf_no_sqz || 0;
  const limpPct = jugador.limp || 0;

  let gapLabel = '';
  if (gap >= 10 && threeBet < 5 && limpPct > 5) {
    gapLabel = 'gap alto con señales pasivas';
  } else if (gap >= 8) {
    gapLabel = 'gap moderado, no necesariamente pasivo';
  } else {
    gapLabel = 'gap normal';
  }

  const prompt = `
Eres un jugador profesional de cash online. Analiza estadísticas COMPLETAS de un oponente ${periodoInfo} y genera un informe detallado y accionable.

🎯 Estilo directo, sin relleno. Usa lenguaje real de poker: "LAG", "se frena en turn", "flotar flop", "3B light", etc.

📌 Gap VPIP–PFR detectado: ${gapLabel}
📌 Si tiene menos de 1000 manos, menciona que el sample es bajo.
📌 Análisis basado en datos de ${tipoPeriodo} del ${jugador.fecha_snapshot}.

---

📊 ESTADÍSTICAS COMPLETAS DE ${jugador.jugador_nombre} ${periodoInfo}:

💰 DATOS BÁSICOS:
- Manos: ${jugador.hands}
- BB/100: ${jugador.bb_100}
- All-in Adj BB/100: ${jugador.all_in_adj_bb_100 || 'N/A'}
- Ganancias: $${jugador.my_c_won}
- Stake: ${jugador.stake_category}

🃏 PREFLOP:
- VPIP: ${jugador.vpip}% | PFR: ${jugador.pfr}% (Gap: ${gap}%)
- 3-Bet: ${threeBet}% | Fold to 3-Bet: ${jugador.two_bet_pf_fold || 0}%
- Fold to 4-Bet: ${jugador.three_bet_pf_fold || 0}%
- 4-Bet+: ${jugador.raise_4bet_plus_pf || 0}%
- Squeeze: ${jugador.pf_squeeze || 0}%
- Limp: ${limpPct}% | Limp/Fold: ${jugador.limp_fold || 0}% | Limp/Raise: ${jugador.limp_raise || 0}%

🎯 POSTFLOP AGGRESSION:
- CBet Flop: ${jugador.cbet_f || 0}% | CBet Turn: ${jugador.cbet_t || 0}% | CBet River: ${jugador.cbet_r || 0}%
- CBet IP (in position): ${jugador.cbet_f_non_3b_nmw || 0}%
- CBet OOP (out of position): ${jugador.cbet_f_non_3b_nmw_non_sb_vs_bb || 0}%
- Donk Flop: ${jugador.donk_f || 0}%
- Check/Raise Flop: ${jugador.xr_flop || 0}% | Check/Raise Turn: ${jugador.xr_turn || 0}%
- Probe Turn: ${jugador.probe_t || 0}%
- Bet River: ${jugador.bet_r || 0}%

🛡️ DEFENSE STATS:
- Fold to Flop CBet: ${jugador.fold_to_f_cbet_non_3b || 0}%
- Float Flop (call CBet): ${jugador.float_f || 0}%
- Fold to Turn CBet: ${jugador.fold_to_t_cbet || 0}%
- Fold to Overbet Turn: ${jugador.fold_t_overbet || 0}%
- Fold to Overbet River: ${jugador.fold_r_overbet || 0}%
- Fold to River Bet: ${jugador.fold_r_bet || 0}%

💥 OVERBET & AGGRESSION:
- Overbet Turn: ${jugador.t_ob_pct || 0}%
- Overbet River: ${jugador.r_ovb_pct || 0}%
- Steal Turn: ${jugador.steal_t || 0}%
- Bet River & Fold: ${jugador.bet_r_fold || 0}%

🏆 SHOWDOWN & WINRATES:
- WWSF: ${jugador.wwsf || 0}% (Won when saw flop)
- WSD: ${jugador.wsd || 0}% (Won at showdown)
- WTSD: ${jugador.wtsd || 0}% (Went to showdown)
- WSDWBR: ${jugador.wsdwbr || 0}% (Won showdown when bet river)
- WSDWOBR: ${jugador.wsdwobr || 0}% (Won showdown when overbet river)
- WSDWRR: ${jugador.wsdwrr || 0}% (Won showdown when raise river)

💸 SIZING & VALUE:
- Bet River Small Pot: ${jugador.bet_r_small_pot || 0}%
- Bet River Big Pot: ${jugador.bet_r_big_pot || 0}%
- Won when River Bet Small: ${jugador.wwrb_small || 0}%
- Won when River Bet Big: ${jugador.wwrb_big || 0}%

---

🎯 Análisis de ${jugador.jugador_nombre} ${periodoInfo}:

1️⃣ Estilo de juego y perfil:  
[Descripción detallada basada en TODAS las stats - 2-3 líneas]

2️⃣ Errores explotables principales:  
- [Leak específico con stat de respaldo]  
- [Leak específico con stat de respaldo]  
- [Leak específico con stat de respaldo]

3️⃣ Cómo explotarlo específicamente:  
[Ajustes tácticos basados en las debilidades identificadas]

4️⃣ Cuidados (fortalezas del oponente):
[Qué evitar hacer contra este jugador]

---

Usa TODAS las estadísticas para identificar patrones, inconsistencias y spots de explotación. Sé específico con los números.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ✨ Usar modelo más potente
      messages: [{ role: "system", content: prompt }],
      max_tokens: 600, // ✨ Aumentado para análisis más detallado
    });

    let analisis = response.choices[0].message.content;
    if (gapLabel === 'gap normal') {
      analisis = analisis.replace(/pasivo/gi, 'equilibrado');
    }

    return { 
      jugador: jugador.jugador_nombre, 
      analisis: analisis,
      periodo: {
        tipo: tipoPeriodo,
        fecha: jugador.fecha_snapshot,
        stake: jugador.stake_category
      },
      stats_completas: true // ✨ Indica que se usaron todas las stats
    };
  } catch (error) {
    console.error("❌ Error con OpenAI:", error);
    return { error: "No se pudo generar el análisis" };
  }
};

// ✨ Sugerencias ACTUALIZADA para usar CSV
const getJugadorSugerencias = async (query, sala) => {
  // Validar sala
  const salasValidas = ['XPK', 'PPP', 'PM'];
  if (!salasValidas.includes(sala)) {
    return [];
  }

  const sql = `
    SELECT DISTINCT jugador_nombre as player_name 
    FROM jugadores_stats_csv
    WHERE LOWER(jugador_nombre) LIKE LOWER($1)
    AND sala = $2
    AND tipo_periodo = 'total'
    AND fecha_snapshot = (
      SELECT MAX(fecha_snapshot) 
      FROM jugadores_stats_csv 
      WHERE sala = $2 AND tipo_periodo = 'total'
    )
    ORDER BY jugador_nombre
    LIMIT 10;
  `;

  try {
    console.log(`🔍 Sugerencias CSV: ${query} en ${sala}`);
    const { rows } = await db.query(sql, [`%${query}%`, sala]); 
    return rows; 
  } catch (error) {
    console.error("❌ Error en sugerencias CSV:", error);
    return [];
  }
};

// ✨ Obtener datos básicos de jugador (wrapper para StatsCSVModel)
const getJugadorData = async (nombre, sala, tipoPeriodo = 'total', fecha = null) => {
  return await StatsCSVModel.getJugador(nombre, sala, tipoPeriodo, fecha);
};

// ✨ Ranking por stake usando CSV
const obtenerTopJugadoresPorStake = async (stakeCategory) => {
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
      fecha_snapshot,
      ROW_NUMBER() OVER (ORDER BY my_c_won DESC) as rank_win
    FROM jugadores_stats_csv 
    WHERE stake_category = $1 
    AND tipo_periodo = 'total'
    AND fecha_snapshot = (
      SELECT MAX(fecha_snapshot) 
      FROM jugadores_stats_csv 
      WHERE stake_category = $1 AND tipo_periodo = 'total'
    )
    AND hands >= 100
    ORDER BY my_c_won DESC 
    LIMIT 10
  `;

  try {
    const result = await db.query(query, [stakeCategory]);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener ranking CSV:', error);
    throw error;
  }
};

// NOTA: La función obtenerGraficoGanancias fue removida porque ahora 
// los gráficos usan el query original de PostgreSQL a través de GraficoModel

module.exports = { 
  getJugadorData, 
  obtenerTopJugadoresPorStake,
  interpretarJugadorData, 
  getJugadorSugerencias 
};